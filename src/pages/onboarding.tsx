/** COMPONENTS */
import { REGISTERED } from "@/lib/session-status";
import { Layout } from "@/ui/components/layout/layout";
import { Seo } from "@/ui/components/seo/seo";
import { Session } from "@/ui/components/session/session";
import { OnboardingContainer } from "@/ui/modules/onboarding/onboarding.container";

export default function Onboarding() {
	return (
		<>
			<Seo
				title="OnBoarding"
				description="Description de la page onboarding"
			/>
			<Session sessionStatus={REGISTERED}>
				<OnboardingContainer />
			</Session> 
		</>
	);
}
