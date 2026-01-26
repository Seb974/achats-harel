import { RecurringCostsList } from "./RecurringCostsList";
import { RecurringCostsCreate } from "./RecurringCostsCreate";
import { RecurringCostsEdit } from "./RecurringCostsEdit";

const recurringCostResourceProps = {
  list: RecurringCostsList,
  create: RecurringCostsCreate,
  edit: RecurringCostsEdit,
  hasShow: false
};

export default recurringCostResourceProps;
