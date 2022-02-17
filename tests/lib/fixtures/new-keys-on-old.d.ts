export interface AssignmentExpression {
  type: "AssignmentExpression";
  operator: AssignmentOperator;
  up: Expression;
  down: Expression;
  left: Pattern | MemberExpression;
  right: Expression;
}
