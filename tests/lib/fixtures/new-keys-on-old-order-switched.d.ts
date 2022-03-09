export interface AssignmentExpression {
  type: "AssignmentExpression";
  operator: AssignmentOperator;
  down: Expression;
  up: Expression;
  left: Pattern | MemberExpression;
  right: Expression;
  nontraversable: RegExp;
}
