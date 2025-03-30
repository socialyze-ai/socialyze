import useOAuthHandler from "@components/auth/OAuthHandler";
import "./Authenticate.scss";

const Authenticate = () => {
  useOAuthHandler();
  return (
    <div className="authenticate-container">
      <p>Authenticating, please wait...</p>
    </div>
  );
};

export default Authenticate;
