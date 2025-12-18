import IntroPage from "../partner/components/UI/IntroPage"
import Login from "../components/Login"
import { useAuth } from "../context/AuthContext"
export default function Home() {
  const {isLogin}=useAuth()
  return (
    <div>
     { isLogin && <Login/>}
        <IntroPage/>
    </div>
  )
}
