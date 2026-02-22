import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { Package, MapPin, ArrowLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const STATUS_CONFIG = {
    pending: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock, label: 'Pending' },
    processing: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Package, label: 'Processing' },
    shipped: { color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: Package, label: 'Shipped' },
    delivered: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2, label: 'Delivered' },
    cancelled: { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: Package, label: 'Cancelled' },
};

// --- Order List Component ---
const OrderCard = ({ order }) => {
    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;

    return (
        <Link to={`/orders/${order.id}`} className="group block bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${config.color} border`}>
                        <StatusIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Order #{order.order_number}</h3>
                        <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total</p>
                        <p className="text-lg font-bold text-slate-900">₹{order.total_amount || order.total}</p>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={20} />
                </div>
            </div>
        </Link>
    );
};

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await orderAPI.getAllOrders();
            setOrders(data);
        } catch (error) { toast.error("Unable to load orders",error); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#fafbfc] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your recent purchases and track shipments.</p>
                </header>

                <div className="space-y-4">
                    {orders.length > 0 ? (
                        orders.map(order => <OrderCard key={order.id} order={order} />)
                    ) : (
                        <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl">
                            <Package className="mx-auto text-slate-300 mb-4" size={48} />
                            <h2 className="text-xl font-semibold text-slate-900">No orders yet</h2>
                            <p className="text-slate-500 mb-6">When you buy something, it will appear here.</p>
                            <Link to="/products" className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-600 transition-all">Browse Store</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Order Detail Component ---
const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false); 

    useEffect(() => { fetchOrder(); }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await orderAPI.getById(id);
            setOrder(data);
        } catch (err) { toast.error("Order not found",err); }
        finally { setLoading(false); }
    };

    const handleCancelOrder = async () => {
        const isConfirmed = window.confirm(
            "Are you sure you want to cancel this order? This action cannot be undone."
        );
        if (!isConfirmed) return;

        setCancelling(true);
        try {
            await orderAPI.cancelOrder(id);
            toast.success("Order cancelled successfully");
            setOrder(prev => ({ ...prev, status: 'cancelled' }));
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || "Failed to cancel order";
            toast.error(msg);
        } 
    };

    if (loading || !order) return null;

    const currentStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

    return (
        <div className="min-h-screen bg-[#fafbfc] py-10 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Navbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to History
                    </button>
                    
                    <div className="flex gap-3">
                        {['pending', 'processing'].includes(order.status) && (
                            <button 
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="px-5 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-transparent hover:border-rose-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {cancelling ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    'Cancel Order'
                                )}
                            </button>
                        )}
                        
                        <button className="px-5 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl shadow-sm hover:bg-slate-50 hover:shadow-md transition-all">
                            Download Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Tracker */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Order #{order.order_number}</h2>
                                    <p className="text-slate-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${currentStatus.color}`}>
                                    <currentStatus.icon size={16} />
                                    {currentStatus.label}
                                </span>
                            </div>
                            
                            {/* Visual Stepper - Hides if cancelled to avoid confusion */}
                            {order.status !== 'cancelled' ? (
                                <div className="relative flex justify-between mt-10">
                                    {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                                        const steps = ['pending', 'processing', 'shipped', 'delivered'];
                                        const isCompleted = steps.indexOf(order.status) >= idx;
                                        return (
                                            <div key={step} className="flex flex-col items-center z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-slate-300'}`}>
                                                    {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                                </div>
                                                <span className={`text-[10px] mt-3 font-bold uppercase tracking-widest transition-colors ${isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}>{step}</span>
                                            </div>
                                        );
                                    })}
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
                                    {/* Progress Line */}
                                    <div 
                                        className="absolute top-4 left-0 h-0.5 bg-indigo-600 transition-all duration-1000 -z-0"
                                        style={{ width: `${(['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) / 3) * 100}%` }}
                                    ></div>
                                </div>
                            ) : (
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3 text-rose-700">
                                    <Package size={20} />
                                    <span className="font-medium">This order was cancelled on {new Date().toLocaleDateString()}.</span>
                                </div>
                            )}
                        </div>

                        {/* Items List (Kept your original logic) */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-900">Items Ordered</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="p-6 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden">
                                            {item.product_image ? (
                                                <img 
                                                    src={item.product_image.startsWith('http') ? item.product_image : `${API_BASE}${item.product_image}`} 
                                                    alt={item.product_name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : <Package className="text-slate-300" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 text-lg">{item.product_name}</h4>
                                            <p className="text-slate-500 font-medium text-sm">Qty: {item.quantity} × ₹{item.unit_price}</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">₹{item.item_total}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <MapPin size={16} className="text-indigo-600" /> Delivery Address
                            </h3>
                            <div className="text-sm text-slate-600 leading-relaxed pl-6 border-l-2 border-slate-100">
                                <p className="font-bold text-slate-900 mb-1">{order.shipped_address?.fullname || 'Home'}</p>
                                <p>{order.shipped_address?.street || order.shipped_address}</p>
                                <p>{order.shipped_address?.city}, {order.shipped_address?.state}</p>
                                <p className="mt-2 font-mono text-xs text-indigo-600 font-medium">{order.shipped_address?.phone}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="font-bold mb-6 text-sm uppercase tracking-wider opacity-80">Summary</h3>
                            <div className="space-y-3 text-sm opacity-90">
                                <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                                <div className="flex justify-between"><span>Shipping</span><span className="text-emerald-400 font-bold">Free</span></div>
                                <div className="flex justify-between"><span>Tax</span><span>₹{order.tax || 0}</span></div>
                                <div className="border-t border-slate-700 pt-4 mt-4 flex justify-between text-xl font-bold opacity-100">
                                    <span>Total</span><span>₹{order.total_amount || order.total}</span>
                                </div>
                            </div>
                            <div className={`mt-6 py-2 px-4 rounded-lg text-center text-[10px] font-black uppercase tracking-widest border ${order.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                Payment {order.payment_status}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export { OrdersList, OrderDetail };