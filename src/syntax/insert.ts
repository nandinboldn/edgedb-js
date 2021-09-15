import {
  Cardinality,
  Expression,
  ExpressionKind,
  LinkDesc,
  ObjectTypeSet,
  ObjectTypeShape,
  PropertyDesc,
  stripSet,
  TypeSet,
  typeutil,
} from "../reflection";

import {
  shapeElementToAssignmentExpression,
  stripBacklinks,
  stripNonWritables,
} from "./update";
import {$expressionify} from "./path";
import {$expr_PathNode} from "../reflection/path";
import {Singletonify} from "./select";

type pointerIsOptional<T extends PropertyDesc | LinkDesc> =
  T["cardinality"] extends
    | Cardinality.Many
    | Cardinality.Empty
    | Cardinality.AtMostOne
    ? true
    : false;

export type InsertShape<Root extends ObjectTypeSet> = typeutil.stripNever<
  stripNonWritables<stripBacklinks<Root["__element__"]["__pointers__"]>>
> extends infer Shape
  ? Shape extends ObjectTypeShape
    ? typeutil.addQuestionMarks<
        {
          [k in keyof Shape]:
            | shapeElementToAssignmentExpression<Shape[k]>
            | (true extends pointerIsOptional<Shape[k]> ? undefined : never);
        }
      >
    : never
  : never;

interface UnlessConflict {
  on: TypeSet | null;
  else?: TypeSet;
}

type InsertBaseExpression<Root extends TypeSet = TypeSet> = {
  __kind__: ExpressionKind.Insert;
  __element__: Root["__element__"];
  __cardinality__: Cardinality.One;
  __expr__: stripSet<Root>;
  __shape__: any;
};
export type $expr_Insert<
  Root extends $expr_PathNode = $expr_PathNode
  // Conflict = UnlessConflict | null
  // Shape extends InsertShape<Root> = any
> = Expression<{
  __kind__: ExpressionKind.Insert;
  __element__: Root["__element__"];
  __cardinality__: Cardinality.One;
  __expr__: Root;
  __shape__: InsertShape<Root>;

  unlessConflict(): $expr_InsertUnlessConflict<
    Expression<{
      __kind__: ExpressionKind.Insert;
      __element__: Root["__element__"];
      __cardinality__: Cardinality.One;
      __expr__: Root;
      __shape__: InsertShape<Root>;
    }>,
    {on: null}
  >;
  unlessConflict<Conflict extends UnlessConflict>(
    conflictGetter: (scope: Singletonify<Root>) => Conflict
  ): $expr_InsertUnlessConflict<
    Expression<{
      __kind__: ExpressionKind.Insert;
      __element__: Root["__element__"];
      __cardinality__: Cardinality.One;
      __expr__: Root;
      __shape__: InsertShape<Root>;
    }>,
    Conflict
  >;
}>;

export type $expr_InsertUnlessConflict<
  Root extends InsertBaseExpression = InsertBaseExpression,
  Conflict extends UnlessConflict = UnlessConflict
> = Expression<{
  __kind__: ExpressionKind.InsertUnlessConflict;
  __element__: Root["__element__"];
  __cardinality__: Cardinality.One;
  __expr__: Root;
  __conflict__: Conflict;
}>;

function unlessConflict(
  this: $expr_Insert,
  conflictGetter?: (scope: TypeSet) => UnlessConflict
) {
  const expr: any = {
    __kind__: ExpressionKind.InsertUnlessConflict,
    __element__: this.__element__,
    __cardinality__: Cardinality.One,
    __expr__: this,
    // __conflict__: Conflict;
  };

  if (!conflictGetter) {
    expr.__conflict__ = {on: null};
    return $expressionify(expr);
  } else {
    const scopedExpr = $expressionify({
      ...this.__expr__,
      __cardinality__: Cardinality.One,
    });
    expr.__conflict__ = conflictGetter(scopedExpr);
    return $expressionify(expr);
  }
}

export function $insertify(
  expr: Omit<$expr_Insert, "unlessConflict">
): $expr_Insert {
  (expr as any).unlessConflict = unlessConflict.bind(expr as any);
  return expr as any;
}

export function insert<Root extends $expr_PathNode>(
  root: Root,
  shape: InsertShape<Root>
): $expr_Insert<Root> {
  const expr: any = {
    __kind__: ExpressionKind.Insert,
    __element__: root.__element__,
    __cardinality__: Cardinality.One,
    __expr__: root,
    __shape__: shape,
  };
  (expr as any).unlessConflict = unlessConflict.bind(expr);
  return $expressionify($insertify(expr)) as any;
}