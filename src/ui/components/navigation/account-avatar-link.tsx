import { useAuth } from "@/Context/AuthUserContext"
import { Avatar } from "@/ui/design-system/avatar/avatar"
import Link from "next/link"

export const AccountAvatarNavigationLink = () => {
    const { authUser } = useAuth();
    const photoURL = authUser?.userDocument?.photourl
      ? `${authUser.userDocument.photourl}?t=${new Date().getTime()}`
      : "/assets/svg/Camera.svg";
    const name = authUser?.userDocument?.name || "Utilisateur";
    return(

       <Link href="/mon-espace" className="flex items-center gap-2">
            <Avatar src={photoURL} alt={name} size="small" />
       </Link>
    )
}