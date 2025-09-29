import { Typography } from '@/ui/design-system/typography/typography';
import React from 'react';
import { FaEnvelope, FaPhoneAlt, FaQuestionCircle } from 'react-icons/fa';

const faqs = [
  {
    question: "Comment puis-je contacter l'assistance ?",
    answer: "Vous pouvez utiliser le formulaire ci-dessous ou nous écrire directement à support@votreplateforme.com."
  },
  {
    question: "Quels sont les délais de réponse ?",
    answer: "Notre équipe s'engage à vous répondre sous 24h ouvrées."
  },
  {
    question: "Où trouver la documentation utilisateur ?",
    answer: "Consultez la rubrique Documentation dans le menu principal pour des guides détaillés."
  },
];

const AideAssistance = () => {
  return (
    <div >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <FaQuestionCircle className="text-yellow-400 text-3xl" />
          <Typography className='font-bold' variant='lead'>Aide & Assistance</Typography>
        </div>
        <Typography variant='body-base'>Vous avez une question ou besoin d'aide ? Notre équipe est là pour vous accompagner. Consultez la FAQ ou contactez-nous directement.</Typography>
        <div className="mb-10 ml-4 mt-14">
          <Typography variant='lead' theme='primary'>FAQ</Typography>
          <ul className="space-y-4">
            {faqs.map((faq, idx) => (
              <li key={idx} className="bg-gray-100 rounded-lg p-4">
                <Typography variant='body-base'>{faq.question}</Typography>
                <div className="text-gray-700 text-sm">{faq.answer}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Typography variant='caption3' >&copy; {new Date().getFullYear()} VotrePlateforme. Tous droits réservés.</Typography>
    </div>
  );
};

export default AideAssistance;



