import { useNavigate } from "react-router-dom";
import Button from "./button";
const ModuleCard = (props) => {
  const navigate = useNavigate();

  return (
    <div className="card-container">
      <h1 className="card-header">{props.header}</h1>

      {props.children ? (
        props.children
      ) : (
        <>
          <div className="card-body">
            <div className="image-container">
              <img src={props.imageSrc} alt={props.altText} />
            </div>
            <div className="button-container">
              <Button onClick={() => navigate(props.navigateTo)}>Open</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModuleCard;
