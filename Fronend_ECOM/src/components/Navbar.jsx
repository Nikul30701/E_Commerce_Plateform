import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/cartStore';

const Navbar = () => {
    const {user} = useAuthStore();
    const {login, logout} = useAuthStore();
    const {cart} = useCartStore();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    }

    return (
        <div>
        
        </div>
    )
}

export default Navbar
