import { Menu, MenuItemLink, useSidebarState } from "react-admin";
import { useClient } from '../../admin/ClientProvider';
import { isDefined } from "../../../app/lib/utils";
import { useState } from 'react';
import { Collapse, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';
import SetMealIcon from '@mui/icons-material/SetMeal';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import DrawIcon from '@mui/icons-material/Draw';
import SellIcon from '@mui/icons-material/Sell';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useSessionContext } from "../../admin/SessionContextProvider";

const CustomMenu = () => {

  const { session } = useSessionContext();
  const user = session?.user;
  const { client } = useClient();
  const [superAdminOpen, setSuperAdminOpen] = useState(false);
  const [openSidebar] = useSidebarState();

  // Déterminer la route produits selon la source de données
  const isOdoo = client?.dataSource === 'odoo';
  const productRoute = isOdoo ? '/odoo_products' : '/harel_products';
  const productLabel = isOdoo ? 'Produits (Odoo)' : 'Produits';

  const handleSuperAdminClick = e => {
    e.preventDefault();
    setSuperAdminOpen(!superAdminOpen);
  };

  return (
    <Menu>
      {/* <Menu.DashboardItem /> */} 
        <Menu.Item
          to={productRoute}
          primaryText={productLabel}
          leftIcon={<SetMealIcon />}
        />
        <Menu.Item
          to="/achats"
          primaryText="Achats"
          leftIcon={<DirectionsBoatIcon />}
        />
        <Menu.Item
          to="/taxes"
          primaryText="Taxes"
          leftIcon={<PaymentsIcon />}
        />

        <MenuItem
          component="a"
          href="/guide-utilisateur/index.html"
          target="_blank"
          rel="noopener"
          sx={{ color: 'text.secondary', py: '6px', fontSize: '0.875rem' }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><MenuBookIcon /></ListItemIcon>
          <ListItemText primary="Guide utilisateur" />
        </MenuItem>

      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
          <MenuItemLink
              to="#"
              onClick={ handleSuperAdminClick }
              primaryText="Administration"
              leftIcon={<TuneIcon className="h-[24px] w-[24px]"/>}
              dense={ !openSidebar }
              sx={{ cursor: 'pointer', backgroundColor: superAdminOpen ? '#EFF2F5' : '#F9FAFB' }}
          >
          </MenuItemLink>
      }
      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Collapse in={ superAdminOpen } timeout="auto" unmountOnExit>
            {/* Champs personnalisés (HAREL) ou Fournisseurs (Odoo) selon la source */}
            {/* @ts-ignore */}
            { isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin") && !isOdoo &&
              <Menu.Item
                  to="/harel_custom_fields"
                  primaryText="Champs personnalisés"
                  leftIcon={<DrawIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            {/* @ts-ignore */}
            { isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin") && isOdoo &&
              <Menu.Item
                  to="/odoo_suppliers"
                  primaryText="Fournisseurs (Odoo)"
                  leftIcon={<PersonIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            {/* @ts-ignore */}
            { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
              <Menu.Item
                  to="/statuses"
                  primaryText="Statuts des achats"
                  leftIcon={<LocalPoliceIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            {/* @ts-ignore */}
            { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
              <Menu.Item
                  to="/tax_types"
                  primaryText="Types de taxe"
                  leftIcon={<SellIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
              <Menu.Item
                  to="/currencies"
                  primaryText="Devises"
                  leftIcon={<CurrencyExchangeIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            {/* @ts-ignore */}
            { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") && client?.hasCoeffCalculation &&
              <Menu.Item
                  to="/recurring_costs"
                  primaryText="Coûts récurrents"
                  leftIcon={<PointOfSaleIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            {/* @ts-ignore */}
            { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
              <Menu.Item
                  to="/clients"
                  primaryText="Client"
                  leftIcon={<PersonIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
        </Collapse>
      }
    </Menu>
  );
};

export default CustomMenu;
