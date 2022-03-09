export interface AssignmentExpression {
  type: "AssignmentExpression";
  operator: AssignmentOperator;
  up: Expression;
  left: Pattern | MemberExpression;
  down: Expression;
  right: Expression;
  nontraversable: RegExp;
}
