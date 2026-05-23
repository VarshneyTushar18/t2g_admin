import { redirect } from "next/navigation";
import { TEAM_LOGIN_PATH } from "@/lib/authUrls";

export default function Home() {
  redirect(TEAM_LOGIN_PATH);
}