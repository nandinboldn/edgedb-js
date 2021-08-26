import {Expression, ExpressionKind, TypeSet} from "../reflection";
import {$expressionify} from "./path";

export function detached<Expr extends TypeSet>(
  expr: Expr
): $expr_Detached<Expr> {
  return $expressionify({
    __element__: expr.__element__,
    __cardinality__: expr.__cardinality__,
    __expr__: expr,
    __kind__: ExpressionKind.Detached,
  });
}

export type $expr_Detached<Expr extends TypeSet = TypeSet> = Expression<{
  __element__: Expr["__element__"];
  __cardinality__: Expr["__cardinality__"];
  __kind__: ExpressionKind.Detached;
}>;

export type $runtimeExpr_Detached = $expr_Detached & {
  __expr__: TypeSet;
};
