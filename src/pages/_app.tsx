import type { AppProps } from "next/app";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Flip, ToastContainer } from "react-toastify";
import { AuthUserProvider } from "@/Context/AuthUserContext";
import { RoleProvider } from "@/Context/RoleContext";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<AuthUserProvider>
			<RoleProvider>
				<ToastContainer 
					position="top-center"
					autoClose={8000}
					transition={Flip}
				/>
				<Component {...pageProps} />
			</RoleProvider>
		</AuthUserProvider>
	);
}