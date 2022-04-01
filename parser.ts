import {parser} from "lezer-python";
import {TreeCursor} from "lezer-tree";
import {BinOp, Expr, Stmt} from "./ast";

export function traverseExpr(c : TreeCursor, s : string) : Expr {
  console.log("Print c: " + c);
  switch(c.type.name) {
    case "Number":
      return {
        tag: "num",
        value: Number(s.substring(c.from, c.to))
      }
    case "VariableName":
      return {
        tag: "id",
        name: s.substring(c.from, c.to)
      }
    case "UnaryExpression":
      // UnaryExpression(ArithOp,Number)
      const content = s.substring(c.from, c.to)
      c.firstChild();
      const unaryOp = s.substring(c.from, c.to);
      if(unaryOp !== "+" && unaryOp !== "-") {
        throw new Error("ParseError: unknown unaryop \"" + unaryOp + "\"");
      }
      c.nextSibling();
      const val = c;
      if(val.type.name !== "Number") {
        throw new Error("ParseError: unknown number \"" + content + "\"");
      }
      c.parent();
      return {
        tag: "num",
        value: Number(s.substring(c.from, c.to)),
      }
    case "BinaryExpression":
      // BinaryExpression(Number,ArithOp,Number)
      c.firstChild();
      const arg1 = traverseExpr(c, s);
      c.nextSibling();
      var binaryOp : BinOp;
      switch(s.substring(c.from, c.to)) {
        case "+":
          binaryOp = BinOp.Add;
          break;
        case "-":
          binaryOp = BinOp.Sub;
          break;
        case "*":
          binaryOp = BinOp.Mul;
          break;
        default:
          throw new Error("ParseError: unknown binary operator");
      }
      c.nextSibling();
      const arg2 = traverseExpr(c, s);
      c.parent();

      // console.log("Arg1: " + arg1 + " Op: " + op + " Arg2: " + arg2);
      return {
        tag: "binary",
        op: binaryOp,
        arg1: arg1,
        arg2: arg2
      }
    case "CallExpression":
      // CallExpression(VariableName,ArgList("(",Number,")"))
      // CallExpression(VariableName,ArgList("(",Number,",",Number,")"))
      c.firstChild();
      const callName = s.substring(c.from, c.to);
      c.nextSibling();
      const args = traverseArgs(c, s);
      console.log("ARGS: " + args);
      c.parent();
      if(args.length == 1) {
        if(callName !== "abs" && callName !== "print")
          throw new Error("ParseError: unknown builtin1 name \"" + callName + "\"");
        else
          return { tag: "builtin1", name: callName, arg: args[0] };
      } else if(args.length == 2) {
        if(callName !== "max" && callName !== "min" && callName !== "pow")
          throw new Error("ParseError: unknown builtin2 name \"" + callName + "\"");
        else
          return { tag: "builtin2", name: callName, arg1: args[0], arg2: args[1] };
      } else {
        throw new Error("ParseError: function \"" + callName + "\" has too many arguments");
      }
    default:
      throw new Error("Could not parse expr at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverseArgs(c : TreeCursor, s : string) : Array<Expr> {
  var result = new Array<Expr>();
  c.firstChild();
  console.log("FIRST C: " + c);

  while(c.nextSibling()) {
    console.log("NOW C: " + c);
    result.push(traverseExpr(c, s));
    c.nextSibling();
  }

  c.parent();

  return result;
}

export function traverseStmt(c : TreeCursor, s : string) : Stmt {
  switch(c.node.type.name) {
    case "AssignStatement":
      c.firstChild(); // go to name
      const name = s.substring(c.from, c.to);
      c.nextSibling(); // go to equals
      c.nextSibling(); // go to value
      const value = traverseExpr(c, s);
      c.parent();
      return {
        tag: "define",
        name: name,
        value: value
      }
    case "ExpressionStatement":
      c.firstChild();
      const expr = traverseExpr(c, s);
      c.parent(); // pop going into stmt
      return { tag: "expr", expr: expr }
    default:
      throw new Error("Could not parse stmt at " + c.node.from + " " + c.node.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverse(c : TreeCursor, s : string) : Array<Stmt> {
  switch(c.node.type.name) {
    case "Script":
      const stmts = [];
      c.firstChild();
      do {
        stmts.push(traverseStmt(c, s));
      } while(c.nextSibling())
      console.log("traversed " + stmts.length + " statements ", stmts, "stopped at " , c.node);
      return stmts;
    default:
      throw new Error("Could not parse program at " + c.node.from + " " + c.node.to);
  }
}
export function parse(source : string) : Array<Stmt> {
  const t = parser.parse(source);
  return traverse(t.cursor(), source);
}
