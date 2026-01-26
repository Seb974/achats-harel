import { CurrenciesList } from "./CurrenciesList";
import { CurrenciesCreate } from "./CurrenciesCreate";
import { CurrenciesEdit } from "./CurrenciesEdit";
import { CurrencyShow } from "./CurrencyShow";

const currencyResourceProps = {
  list: CurrenciesList,
  create: CurrenciesCreate,
  edit: CurrenciesEdit,
  hasShow: false,
  show: CurrencyShow
};

export default currencyResourceProps;
