import { UseFormRegister, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { Typography } from '@/ui/design-system/typography/typography';
import { Button } from '@/ui/design-system/button/button';
import { Input } from '@/ui/design-system/forms/input';
import { Textarea } from '@/ui/design-system/forms/textarea';

interface MessageFormData {
    fullName: string;
    phone?: string;
    email: string;
    message: string;
}

interface Props {
    register: UseFormRegister<MessageFormData>;
    errors: FieldErrors<MessageFormData>;
    isLoading: boolean;
    onSubmit: (data: MessageFormData) => Promise<void>;
    handleSubmit: UseFormHandleSubmit<MessageFormData>;
}

export const MessageForm = ({ register, errors, isLoading, onSubmit, handleSubmit }: Props) => {
    return (
        <div className=" bg-gray-400 rounded shadow-lg overflow-hidden">
            {/* Header avec gradient */}
            <div className="bg-secondary text-center px-6 py-4">
                <Typography 
                    variant="lead" 
                >
                    Avez-vous une question ?
                </Typography>
                <Typography 
                    variant="body-sm" 
                    className="text-gray text-center mt-1"
                >
                    Envoyez-nous un message
                </Typography>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                {/* Nom et prénom */}
                <Input
                    label="Nom et prénom"
                    isLoading={isLoading}
                    placeholder="Yves AKA"
                    type="text"
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez renseigner votre nom et prénom"
                    id="fullName"
                    required={true}
                />

                {/* Téléphone */}
                <Input
                    label="Téléphone"
                    isLoading={isLoading}
                    placeholder="+229 61 08 54 86"
                    type="int"
                    register={register}
                    errors={errors}
                    errorMsg="Veuillez entrer un numéro de téléphone valide"
                    id="phone"
                    required={false}
                />

                {/* Email */}
                <Input
                    label="Adresse email"
                    isLoading={isLoading}
                    placeholder="henrimikith@gmail.com"
                    type="email"
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez renseigner une adresse email valide"
                    id="email"
                    required={true}
                />

                {/* Message */}
                <Textarea
                    label="Votre message"
                    isLoading={isLoading}
                    placeholder="Écrivez votre message ici..."
                    register={register}
                    errors={errors}
                    errorMsg="Vous devez saisir votre message"
                    id="message"
                    required={true}
                    rows={4}
                />

                {/* Bouton d'envoi */}
                <Button
                    variant='secondary'
                    type="submit"
                    size="large"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isLoading ? 'Envoi...' : 'Envoyer'}
                </Button>
            </form>
        </div>
    );
};