import { TaxTypesList } from "./TaxTypesList";
import { TaxTypesCreate } from "./TaxTypesCreate";
import { TaxTypesEdit } from "./TaxTypesEdit";

const taxTypeResourceProps = {
  list: TaxTypesList,
  create: TaxTypesCreate,
  edit: TaxTypesEdit,
  hasShow: false
};

export default taxTypeResourceProps;
