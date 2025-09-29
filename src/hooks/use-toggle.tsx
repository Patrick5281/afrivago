import { useState } from "react";
interface Props {
    initial?: boolean
}
export const useToggle = ({initial=false}: Props={}) =>{
 const [value, setvalue] = useState<boolean>(initial);
 const toggle=() => {
    setvalue(!value);
 };

return{

    value,
    setvalue,
    toggle,
};
    

};