import * as mocha from 'mocha';
import {assert, expect} from 'chai';
import { parser } from 'lezer-python';
import { traverseExpr, traverseStmt, traverse, parse } from '../parser';
import { BinOp } from '../ast';

// We write tests for each function in parser.ts here. Each function gets its 
// own describe statement. Each it statement represents a single test. You
// should write enough unit tests for each function until you are confident
// the parser works as expected. 
describe('traverseExpr(c, s) function', () => {
  it('parses a number in the beginning', () => {
    const source = "987";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(parsedExpr).to.deep.equal({tag: "num", value: 987});
  })

  // TODO: add additional tests here to ensure traverseExpr works as expected
  it('parses a negative number in the beginning', () => {
    const source = "-10";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const parsedExpr = traverseExpr(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(parsedExpr).to.deep.equal({tag: "num", value: -10});
  })

  it('parses an assignment in the beginning', () => {
    const source = "x=3";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const varName = traverseExpr(cursor, source);
    cursor.nextSibling();
    cursor.nextSibling();
    const varValue = traverseExpr(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(varName).to.deep.equal({tag: "id", name: "x"});
    expect(varValue).to.deep.equal({tag: "num", value: 3});
  })

  it('parses a binary operation in the beginning', () => {
    const source = "3*2";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const bin = traverseExpr(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(bin).to.deep.equal(
      {tag: "binary", op: BinOp.Mul, arg1: {tag: "num", value: 3}, arg2: {tag: "num", value: 2}}
    );
  })

  it('parses a unary function call in the beginning', () => {
    const source = "abs(1)";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const func = traverseExpr(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(func).to.deep.equal({tag: "builtin1", name: "abs", arg: {tag: "num", value: 1}});
  })

  it('parses a binary function call in the beginning', () => {
    const source = "max(1, 2)";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();
    // go to expression
    cursor.firstChild();

    const func = traverseExpr(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(func).to.deep.equal(
      {tag: "builtin2", name: "max", arg1: {tag: "num", value: 1}, arg2: {tag: "num", value: 2}}
    );
  })

  it('parses a unary function call in the beginning with wrong # of args', () => {
    const source = "abs(1,2)";
    const cursor = parser.parse(source).cursor();
    cursor.firstChild();
    cursor.firstChild();
    try {
      traverseExpr(cursor, source);
    } catch(error) {
      if(!(error.message as string).includes("ParseError"))
        assert(false, "Error message doesn't contain \"ParseError\"");
      return;
    }
    assert(false, "Should throw a \"ParseError\"");
  })

  it('parses a binary function call in the beginning with wrong # of args', () => {
    const source = "max()";
    const cursor = parser.parse(source).cursor();
    cursor.firstChild();
    cursor.firstChild();
    try {
      traverseExpr(cursor, source);
    } catch(error) {
      if(!(error.message as string).includes("ParseError"))
        assert(false, "Error message doesn't contain \"ParseError\"");
      return;
    }
    assert(false, "Should throw a \"ParseError\"");
  })
});

describe('traverseStmt(c, s) function', () => {
  // TODO: add tests here to ensure traverseStmt works as expected
  it('parses an assign statement in the beginning', () => {
    const source = "x=3";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();

    const func = traverseStmt(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(func).to.deep.equal(
      {tag: "define", name: "x", value: {tag: "num", value: 3}}
    );
  })
  it('parses a regular expression in the beginning', () => {
    const source = "5-2";
    const cursor = parser.parse(source).cursor();

    // go to statement
    cursor.firstChild();

    const func = traverseStmt(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(func).to.deep.equal(
      {tag: "expr", expr: {tag: "binary", op: BinOp.Sub, arg1: {tag: "num", value: 5}, arg2: {tag: "num", value: 2}}}
    );
  })
});

describe('traverse(c, s) function', () => {
  // TODO: add tests here to ensure traverse works as expected
  it('parses a script: x=3;x+2', () => {
    const source = "x=3\nx+2";
    const cursor = parser.parse(source).cursor();

    const func = traverse(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(func).to.deep.equal(
      [{tag: "define", name: "x", value: {tag: "num", value: 3}},
       {tag: "expr", expr: {tag: "binary", op: BinOp.Add, arg1: {tag: "id", name: "x"}, arg2: {tag: "num", value: 2}}}]
    );
  })
});

describe('parse(source) function', () => {
  it('parse a number', () => {
    const parsed = parse("987");
    expect(parsed).to.deep.equal([{tag: "expr", expr: {tag: "num", value: 987}}]);
  });  

  // TODO: add additional tests here to ensure parse works as expected
  it('parse a script x=1;y=2;max(x, y)', () => {
    const source = "x=1\ny=2\nmax(x, y)";
    const cursor = parser.parse(source).cursor();

    const func = traverse(cursor, source);

    // Note: we have to use deep equality when comparing objects
    expect(func).to.deep.equal(
      [{tag: "define", name: "x", value: {tag: "num", value: 1}},
       {tag: "define", name: "y", value: {tag: "num", value: 2}},
       {tag: "expr", expr: {tag: "builtin2", name: "max", arg1: {tag: "id", name: "x"}, arg2: {tag: "id", name: "y"}}}]
    );
  });  
});