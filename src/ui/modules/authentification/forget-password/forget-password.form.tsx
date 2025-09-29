import { FormsType } from "@/types/forms";
import { Button } from "@/ui/design-system/button/button";
import { Input } from "@/ui/design-system/forms/input";

interface Props {
    form: FormsType;
}
export const ForgetPasswordform = ({form}: Props) => {
    const{control, onSubmit, errors, register, isLoading, handleSubmit} = form;
    return(
               <form onSubmit={handleSubmit(onSubmit)} className="pt-8 pb-5 space-y-4">
                     <Input
                     isLoading={isLoading}
                     placeholder="johnsmith@gmail.com"
                     type = "email"
                     register={register}
                     errors={errors}
                     errorMsg="Tu dois renseigner ce champ"
                     required
                     id="email"
                     />
               
                 <Button type="submit" disabled={isLoading} isLoading={isLoading} fullwith >
                   Envoyer
                 </Button>
               </form>
    )
}