import { StatusesList } from "./StatusesList";
import { StatusesCreate } from "./StatusesCreate";
import { StatusesEdit } from "./StatusesEdit";

const statusResourceProps = {
  list: StatusesList,
  create: StatusesCreate,
  edit: StatusesEdit,
  hasShow: false
};

export default statusResourceProps;
