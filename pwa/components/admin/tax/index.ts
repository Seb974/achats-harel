import { TaxesList } from "./TaxesList";
import { TaxesCreate } from "./TaxesCreate";
import { TaxesEdit } from "./TaxesEdit";
import { TaxShow } from "./TaxShow";

const taxResourceProps = {
  list: TaxesList,
  create: TaxesCreate,
  edit: TaxesEdit,
  hasShow: false,
  show: TaxShow
};

export default taxResourceProps;
