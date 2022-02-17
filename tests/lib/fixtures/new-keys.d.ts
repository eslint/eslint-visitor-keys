export interface NewFangledExpression {
  type: "NewFangledExpression";
  operator: AssignmentOperator;
  up: Expression;
  down: Expression;
  left: Pattern | MemberExpression;
  right: Expression;
}
