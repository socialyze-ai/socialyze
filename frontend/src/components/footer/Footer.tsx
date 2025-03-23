import { WEBSITE_URL } from "../../config/endpoints";
import "./Footer.scss";

export const Footer = () => {
  return (
    <div className="footer">
      Copyright ©2023 SimpleEffex |&nbsp;
      <a href={`${WEBSITE_URL}/privacy-policy.html`} target="_blank">
        Privacy
      </a>
      &nbsp;|&nbsp;
      <a href={`${WEBSITE_URL}/terms-of-service.html`} target="_blank">
        Terms
      </a>
    </div>
  );
};

export default Footer;
