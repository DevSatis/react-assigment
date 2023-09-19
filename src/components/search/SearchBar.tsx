import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config/config";
import { CONTACT } from "../../constants/backend.constants";
import "./SearchBar.css";
import { useNavigate, useLocation } from "react-router-dom";
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

type Contact = {
  id: number;
  company_name: string;
};

type Props = {};

const ContactSelector: React.FC<Props> = () => {
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const urlSearchParams = new URLSearchParams(location.search);
  const urlSearchTerm = urlSearchParams.get("contact") || "";
  const urlContactId = urlSearchParams.get("id") || "";
  const urlPaginate = urlSearchParams.get("paginate") || "false";
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [contactId, setContactId] = useState(Number(urlContactId)); 
  const [paginate, setPaginate] = useState(urlPaginate === "true");


  const fetchContacts = (searchTerm: string) => {
    axios
      .get(`${config.BACKEND_BASE + CONTACT.LIST}`, {
        params: {
          search: searchTerm,
          paginate: true,
          limit: 25,
          offset: 0,
        },
      })
      .then((response) => {
        setContacts(response.data.results);
      })
      .catch((error) => {
        console.error("Error fetching contacts:", error);
      });
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setSearchTerm(contact.company_name);
    setContactId(contact.id);
    setPaginate(true)
    urlSearchParams.set("contact", contact.company_name);
    urlSearchParams.set("id", contact.id.toString());
    navigate({ search: urlSearchParams.toString() });
    setIsDropdownOpen(false);
    setShowResetButton(true);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedContact(null);
    setContacts([]);
    setContactId(0);
    setPaginate(false);
    setIsDropdownOpen(true);
    setShowResetButton(false);
  };

  const handleSearchBarClick = () => {
    if (searchTerm.trim() === "") {
      fetchContacts("");
    }
    setIsDropdownOpen(true);
  };

  useEffect(() => {

    urlSearchParams.set("contact", searchTerm);
    urlSearchParams.set("id", contactId.toString()); 
    urlSearchParams.set("paginate", String(paginate));
    navigate({ search: urlSearchParams.toString() });

    if (searchTerm.trim() === "") {
      setContacts([]);
      setIsDropdownOpen(false);
      fetchContacts("");
      return;
    }

    fetchContacts(searchTerm);
  }, [searchTerm]);

  return (
    <>
      <div className="search">
        <input
          type="text"
          placeholder="Search for supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={handleSearchBarClick}
        />
        {isDropdownOpen && (
          <div className="dropdown">
            <ul>
              {Array.isArray(contacts) &&
                contacts.map((contact) => (
                  <li
                    key={contact.id}
                    className="dropdown-item"
                    onClick={() => handleContactSelect(contact)}
                  >
                    {contact.company_name}
                  </li>
                ))}
            </ul>
          </div>
        )}
        {showResetButton && (<button onClick={handleReset}><CancelRoundedIcon /></button>)}
      </div>
    </>
  );
};

export default ContactSelector;

