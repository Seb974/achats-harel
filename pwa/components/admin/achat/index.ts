import { AchatsList } from "./AchatsList";
import { AchatsCreate } from "./AchatsCreate";
import { AchatsEdit } from "./AchatsEdit";
import { AchatShow } from "./AchatShow";

const achatResourceProps = {
  list: AchatsList,
  create: AchatsCreate,
  edit: AchatsEdit,
  hasShow: false,
  show: AchatShow
};

export default achatResourceProps;
