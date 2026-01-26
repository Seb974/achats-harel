import { AppBar, UserMenu, TitlePortal } from "react-admin";
import { useDataProvider } from "react-admin";
import Logout from "./Logout";
import Image from "next/image";
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useClient } from '../../admin/ClientProvider';
import GlobalLoader from "../../admin/layout/GlobalLoader";
import Oidc from "./Oidc";
import { useEffect, useState } from "react";
import { useSessionContext } from "../../admin/SessionContextProvider";

const CustomAppBar = () => {

  const { session } = useSessionContext();
  const user = session?.user;
  const dataProvider = useDataProvider();
  const { client, loading } = useClient();
  const authorizedProfiles = ['pro', 'instructeur', 'secretariat'];
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [fallback, setFallback] = useState(false);

  const baseUrl = client?.url?.replace(/\/+$/, "") ?? "";
  let logoPath = client?.logo ?? "images/logo.png";

  if (!/^https?:\/\//.test(logoPath)) {
    logoPath = logoPath.startsWith("/") ? logoPath : `/${logoPath}`;
    logoPath = `${baseUrl}${logoPath}`;
  }

  const logoSrc = logoPath;

  const getLogoUrl = () => {
    const defaultLogo = `${baseUrl}/images/logo.png`;
    return fallback ? defaultLogo : (logoSrc || defaultLogo);
  };

  {/* @ts-ignore  */}
  const isAdmin = (user) => isDefined(user) && user.roles.find(r => r === "admin");
  
  return loading || profileLoading ? <GlobalLoader/> : 
    isDefined(client) && (
      <AppBar
        sx={{ backgroundColor: client.color || 'primary' }}
        userMenu={
          <UserMenu>
            {/* @ts-ignore  */}
            { isAdmin(user) && <Oidc /> }
            <Logout />
          </UserMenu>
        }
      >
        <TitlePortal />
        <div className="flex-1">
          <Link to="/">
            <div style={{ position: "relative", width: 50, height: 50 }}>
              <Image
                alt={"logo " + client.name}
                src={getLogoUrl()}
                fill
                sizes="50px" 
                onError={() => setFallback(true)}
                className="object-contain"
                unoptimized
              />
            </div>

          </Link>
          
        </div>
      </AppBar>
    )
};

export default CustomAppBar;
