import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Pizza, Sandwich, Check, User, Clock, CreditCard, Smartphone, Bike, MapPin, Trash2, Plus, Minus, ReceiptText, PackageCheck, QrCode, Search, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeCanvas } from "qrcode.react";

// --- Paleta
const colors = {
  primary: "#E53E3E", // vermelho vibrante
  accent: "#FF8C00", // laranja para destaques
  success: "#10B981", // verde ações positivas
};

// --- Tipos (simples)
/** @typedef {{ id:string; name:string; description:string; price:number; image:string; category:'pizza'|'burger'|'drink'; tags?:string[] }} Product */
/** @typedef {{ productId:string; qty:number; notes?:string; options?:Record<string, string|boolean> }} OrderItem */
/** @typedef {{ id:string; items:OrderItem[]; total:number; status:'Recebido'|'Em preparo'|'A caminho'|'Entregue'|'Cancelado'; createdAt:number; customer: CustomerProfile; payment?: { method:'PIX'|'Cartão'; pixPayload?:string; cardLast4?:string } }} Order */
/** @typedef {{ name:string; phone:string; address:string; number?:string; complement?:string; district?:string; city?:string; uf?:string; cep?:string; whatsapp?:string; email?:string }} CustomerProfile */

// --- Mock de produtos
/** @type {Product[]} */
const MOCK_PRODUCTS = [
  // PIZZAS TRADICIONAIS
  { id: "pz-mussarela", name: "Mussarela", description: "Molho de tomate, mussarela e orégano.", price: 41.99, image: "/images/pizzas/mussarela.jpg", category: 'pizza', tags:["Tradicional"] },
  { id: "pz-calabresa", name: "Calabresa", description: "Molho de tomate, mussarela, calabresa fatiada e orégano.", price: 41.99, image: "/images/pizzas/calabresa.jpg", category: 'pizza', tags:["Mais pedida"] },
  { id: "pz-frango", name: "Frango", description: "Molho de tomate, mussarela, frango desfiado e orégano.", price: 41.99, image: "/images/pizzas/frango.jpg", category: 'pizza', tags:[] },
  { id: "pz-napolitana", name: "Napolitana", description: "Molho, mussarela, tomate, parmesão e orégano.", price: 41.99, image: "/images/pizzas/napolitana.jpg", category: 'pizza', tags:["Clássica"] },

  // PIZZAS ESPECIAIS
  { id: "pz-frango-catupiry", name: "Frango com Catupiry", description: "Molho, mussarela, frango, catupiry e orégano.", price: 45.99, image: "/images/pizzas/frango_catupiry.jpg", category: 'pizza', tags:["Especial","Cremosa"] },
  { id: "pz-portuguesa", name: "Portuguesa", description: "Molho, mussarela, presunto, ovo, cebola, pimentão e orégano.", price: 45.99, image: "/images/pizzas/portuguesa.jpg", category: 'pizza', tags:["Especial"] },
  { id: "pz-bacon", name: "Bacon", description: "Molho, mussarela e bacon crocante.", price: 45.99, image: "/images/pizzas/bacon.jpg", category: 'pizza', tags:["Bacon"] },
  { id: "pz-moda", name: "Moda da Casa", description: "Molho, mussarela, calabresa, bacon, pimentão e orégano.", price: 45.99, image: "/images/pizzas/moda.jpg", category: 'pizza', tags:["Especial"] },

  // PIZZAS DOCES
  { id: "pz-chocolate", name: "Chocolate", description: "Chocolate ao leite derretido e granulados.", price: 41.99, image: "/images/pizzas/chocolate.jpg", category: 'pizza', tags:["Doce"] },
  { id: "pz-banana", name: "Banana com Canela", description: "Banana, açúcar e canela.", price: 41.99, image: "/images/pizzas/banana.jpg", category: 'pizza', tags:["Doce"] },
  { id: "pz-morango-choc", name: "Morango com Chocolate", description: "Morangos frescos com chocolate derretido.", price: 41.99, image: "/images/pizzas/morango_chocolate.jpg", category: 'pizza', tags:["Doce"] },
  { id: "pz-abacaxi", name: "Abacaxi", description: "Abacaxi caramelizado e leite condensado.", price: 41.99, image: "/images/pizzas/abacaxi.jpg", category: 'pizza', tags:["Doce"] },

  // HAMBÚRGUERES
  { id: "bg-xburger", name: "X-Burger", description: "Pão, hambúrguer artesanal, queijo e maionese da casa.", price: 22.99, image: "/images/burgers/xburger.jpg", category: 'burger', tags:["Smash"] },
  { id: "bg-xsalada", name: "X-Salada", description: "Hambúrguer artesanal, queijo, alface, tomate e maionese da casa.", price: 24.99, image: "/images/burgers/xsalada.jpg", category: 'burger', tags:["Fresco"] },
  { id: "bg-xbacon", name: "X-Bacon", description: "Hambúrguer artesanal, queijo, bacon crocante e maionese da casa.", price: 26.99, image: "/images/burgers/xbacon.jpg", category: 'burger', tags:["Bacon"] },
  { id: "bg-xtudo", name: "X-Tudo", description: "Hambúrguer artesanal, queijo, presunto, bacon, ovo, salada e maionese da casa.", price: 29.99, image: "/images/burgers/xtudo.jpg", category: 'burger', tags:["Completo"] },

  // BEBIDAS — REFRIGERANTES (2L e 1,5L)
  { id: "dr-coca-2l", name: "Coca-Cola 2L", description: "Refrigerante 2 litros.", price: 12.99, image: "/images/drinks/coca_2l.jpg", category: 'drink', tags:["2L"] },
  { id: "dr-coca-1_5l", name: "Coca-Cola 1,5L", description: "Refrigerante 1,5 litros.", price: 10.99, image: "/images/drinks/coca_1_5l.jpg", category: 'drink', tags:["1,5L"] },
  { id: "dr-fanta-2l", name: "Fanta Laranja 2L", description: "Refrigerante 2 litros.", price: 11.99, image: "/images/drinks/fanta_2l.jpg", category: 'drink', tags:["2L"] },
  { id: "dr-fanta-1_5l", name: "Fanta Laranja 1,5L", description: "Refrigerante 1,5 litros.", price: 9.99, image: "/images/drinks/fanta_1_5l.jpg", category: 'drink', tags:["1,5L"] },
  { id: "dr-guarana-2l", name: "Guaraná Antarctica 2L", description: "Refrigerante 2 litros.", price: 11.99, image: "/images/drinks/guarana_2l.jpg", category: 'drink', tags:["2L"] },
  { id: "dr-guarana-1_5l", name: "Guaraná Antarctica 1,5L", description: "Refrigerante 1,5 litros.", price: 9.99, image: "/images/drinks/guarana_1_5l.jpg", category: 'drink', tags:["1,5L"] },

  // BEBIDAS — CERVEJAS (lata 500ml)
  { id: "dr-heineken-500", name: "Heineken Lata 500ml", description: "Cerveja Pilsen 500ml.", price: 12.99, image: "/images/drinks/heineken_500.jpg", category: 'drink', tags:["500ml"] },
  { id: "dr-amstel-500", name: "Amstel Lata 500ml", description: "Cerveja Pilsen 500ml.", price: 10.99, image: "/images/drinks/amstel_500.jpg", category: 'drink', tags:["500ml"] },
  { id: "dr-brahma-500", name: "Brahma Lata 500ml", description: "Cerveja 500ml.", price: 9.99, image: "/images/drinks/brahma_500.jpg", category: 'drink', tags:["500ml"] },
  { id: "dr-antarctica-500", name: "Antarctica Lata 500ml", description: "Cerveja 500ml.", price: 9.99, image: "/images/drinks/antarctica_500.jpg", category: 'drink', tags:["500ml"] },
];

// --- Helpers armazenamento
const LS_KEYS = {
  CART: "delivery.cart.v1",
  ORDERS: "delivery.orders.v1",
  PROFILE: "delivery.profile.v1",
};

const currency = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// --- PIX payload gerado simples (simulado)
const makePixPayload = (value, name, city, txid) => {
  // Simulação simplificada do BR Code – apenas para demonstração UI
  return `00020126580014BR.GOV.BCB.PIX0114+55319999999952040000530398654${value.toFixed(2).replace('.', '')}5802BR5913${(name||'Cliente').slice(0,13)}6009${(city||'Cidade').slice(0,9)}62070503***6304${(txid||'ABCD')}`;
};

// --- App
export default function DeliveryApp() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("pizza");
  const [page, setPage] = useState("home"); // home | cart | checkout | orders | profile
  const [cart, setCart] = useState(/** @type {OrderItem[]} */([]));
  const [profile, setProfile] = useState(/** @type {CustomerProfile} */({ name: "", phone: "", address: "", whatsapp: "" }));
  const [orders, setOrders] = useState(/** @type {Order[]} */([]));
  const [showAdded, setShowAdded] = useState(false);

  // Load from LS
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(LS_KEYS.CART) || "[]");
      const o = JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || "[]");
      const p = JSON.parse(localStorage.getItem(LS_KEYS.PROFILE) || "{}");
      setCart(c);
      setOrders(o);
      setProfile({ ...{ name: "", phone: "", address: "", whatsapp: "" }, ...p });
    } catch {}
  }, []);
  useEffect(() => localStorage.setItem(LS_KEYS.CART, JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem(LS_KEYS.PROFILE, JSON.stringify(profile)), [profile]);

  const filtered = useMemo(() => products.filter(p => (!query || (p.name+" "+p.description).toLowerCase().includes(query.toLowerCase())) && (tab==='all' || p.category===tab)), [products, query, tab]);
  const cartTotal = useMemo(() => cart.reduce((sum, it) => sum + (products.find(p=>p.id===it.productId)?.price||0) * it.qty, 0), [cart, products]);

  // Order status progression simulation
  useEffect(() => {
    const timers = [];
    orders.forEach((o) => {
      if (o.status === 'Recebido') {
        const t1 = setTimeout(() => updateOrderStatus(o.id, 'Em preparo'), 5000);
        timers.push(t1);
        const t2 = setTimeout(() => updateOrderStatus(o.id, 'A caminho'), 15000);
        timers.push(t2);
        const t3 = setTimeout(() => updateOrderStatus(o.id, 'Entregue'), 30000);
        timers.push(t3);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [orders.length]);

  const updateOrderStatus = (orderId, status) => setOrders(prev => prev.map(o => o.id===orderId? { ...o, status }: o));

  const addToCart = (productId, qty=1, options={}, notes="") => {
    setCart(prev => {
      const i = prev.findIndex(it => it.productId===productId && JSON.stringify(it.options)===JSON.stringify(options) && (it.notes||"") === (notes||""));
      if (i>=0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { productId, qty, options, notes }];
    });
    setShowAdded(true);
    setTimeout(()=>setShowAdded(false), 1200);
  };

  const removeFromCart = (index) => setCart(prev => prev.filter((_,i)=>i!==index));
  const changeQty = (index, delta) => setCart(prev => prev.map((it,i)=> i===index? { ...it, qty: Math.max(1, it.qty+delta)}: it));
  const emptyCart = () => setCart([]);

  const placeOrder = (payment) => {
    if (!profile.name || !profile.address || !profile.phone) {
      alert('Preencha seu perfil (nome, telefone e endereço) antes de finalizar.');
      setPage('profile');
      return;
    }
    const id = uid();
    const total = cartTotal;
    /** @type {Order} */
    const order = {
      id,
      items: cart,
      total,
      status: 'Recebido',
      createdAt: Date.now(),
      customer: profile,
      payment,
    };
    setOrders(prev => [order, ...prev]);
    emptyCart();
    setPage('orders');
  };

  const orderToWhatsAppText = (o) => {
    const lines = [];
    lines.push(`Pedido #${o.id}`);
    lines.push(new Date(o.createdAt).toLocaleString('pt-BR'));
    lines.push('Itens:');
    o.items.forEach((it) => {
      const p = products.find(p=>p.id===it.productId);
      lines.push(`- ${it.qty}x ${p?.name} (${currency((p?.price||0)*it.qty)})`);
      if (it.notes) lines.push(`  Obs: ${it.notes}`);
      const opts = it.options || {};
      const optKeys = Object.keys(opts);
      optKeys.forEach(k => lines.push(`  ${k}: ${opts[k]}`));
    });
    lines.push(`Total: ${currency(o.total)}`);
    lines.push(`Pagamento: ${o.payment?.method}`);
    lines.push(`Nome: ${o.customer.name}`);
    lines.push(`Telefone: ${o.customer.phone}`);
    lines.push(`Endereço: ${o.customer.address}`);
    return encodeURIComponent(lines.join('\n'));
  };

  const WA_BUSINESS = "5531973163287"; // WhatsApp da pizzaria
  const waLinkForOrder = (o) => {
    return `https://wa.me/${WA_BUSINESS}?text=${orderToWhatsAppText(o)}`;
  };

  const NavButton = ({ icon:Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition ${active? 'bg-white shadow-lg' : 'bg-white/70 hover:bg-white'} text-gray-700`}
      style={{ border: '1px solid rgba(0,0,0,0.06)'}}
    >
      <Icon size={20} />
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{
      backgroundImage: `radial-gradient(50% 50% at 100% 0%, ${colors.primary}0D 0%, transparent 60%), radial-gradient(40% 40% at 0% 100%, ${colors.accent}12 0%, transparent 70%)`
    }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-black/5">
        <div className="max-w-6xl mx-auto flex items-center gap-3 p-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{backgroundColor: colors.primary}}>
            <Pizza className="text-white" />
          </div>
          <div className="font-bold text-lg">XTREME PIZZARIA</div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <div className="relative">
              <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar no cardápio" className="pl-9 w-72"/>
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <Button variant="secondary" onClick={()=>setPage('orders')} className="rounded-2xl"><ReceiptText className="mr-2" size={16}/>Meus Pedidos</Button>
            <Button variant="secondary" onClick={()=>setPage('profile')} className="rounded-2xl"><User className="mr-2" size={16}/>Perfil</Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="rounded-2xl" style={{backgroundColor: colors.primary}}>
                  <ShoppingCart className="mr-2" size={18}/>{cart.length} – {currency(cartTotal)}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[420px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Seu carrinho</SheetTitle>
                </SheetHeader>
                <CartPanel products={products} cart={cart} changeQty={changeQty} removeFromCart={removeFromCart} emptyCart={emptyCart} onCheckout={()=>setPage('checkout')} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {page==='home' && (
          <HomePage
            tab={tab}
            setTab={setTab}
            query={query}
            setQuery={setQuery}
            products={filtered}
            addToCart={addToCart}
          />
        )}
        {page==='cart' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <CartPanel products={products} cart={cart} changeQty={changeQty} removeFromCart={removeFromCart} emptyCart={emptyCart} />
            </div>
            <SummaryCard total={cartTotal} onCheckout={()=>setPage('checkout')} />
          </div>
        )}
        {page==='checkout' && (
          <CheckoutPage
            total={cartTotal}
            profile={profile}
            setProfile={setProfile}
            onPlaceCard={(card) => {
              const last4 = (card.number||'').slice(-4);
              placeOrder({ method:'Cartão', cardLast4:last4 });
            }}
            onPlacePix={() => {
              const txid = uid().slice(0,6).toUpperCase();
              const payload = makePixPayload(cartTotal, profile.name||'Cliente', 'Cidade', txid);
              placeOrder({ method:'PIX', pixPayload: payload });
            }}
          />
        )}
        {page==='orders' && (
          <OrdersPage orders={orders} waLinkForOrder={waLinkForOrder} />
        )}
        {page==='profile' && (
          <ProfilePage profile={profile} setProfile={setProfile} />
        )}
      </main>

      {/* Bottom Nav (mobile) */}
      <div className="fixed md:hidden bottom-3 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2 p-2 rounded-3xl bg-white/90 shadow-lg border border-black/5 backdrop-blur">
          <NavButton icon={Pizza} label="Cardápio" active={page==='home'} onClick={()=>setPage('home')} />
          <NavButton icon={ShoppingCart} label="Carrinho" active={page==='cart'} onClick={()=>setPage('cart')} />
          <NavButton icon={ReceiptText} label="Pedidos" active={page==='orders'} onClick={()=>setPage('orders')} />
          <NavButton icon={User} label="Perfil" active={page==='profile'} onClick={()=>setPage('profile')} />
        </div>
      </div>

      {/* Toast de item adicionado */}
      <AnimatePresence>
        {showAdded && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-black/5 rounded-2xl px-4 py-2 flex items-center gap-2">
            <Check size={18} className="text-green-600"/> Adicionado ao carrinho
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA flutuante do carrinho (mobile) */}
      {page!=="checkout" && (
        <button onClick={()=>setPage('cart')} className="md:hidden fixed bottom-24 right-3 rounded-full shadow-xl px-4 py-3 text-white flex items-center gap-2" style={{backgroundColor: colors.primary}}>
          <ShoppingCart size={18}/> {cart.length} – {currency(cartTotal)}
        </button>
      )}
    </div>
  );
}

function HomePage({ tab, setTab, query, setQuery, products, addToCart }){
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-5 gap-2 bg-white/60 rounded-2xl p-1">
            <TabsTrigger value="pizza" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow">🍕 Pizzas</TabsTrigger>
            <TabsTrigger value="burger" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow">🍔 Burgers</TabsTrigger>
            <TabsTrigger value="drink" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow">🥤 Bebidas</TabsTrigger>
            <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow">Tudo</TabsTrigger>
            <div className="hidden md:flex ml-auto items-center relative">
              <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar..." className="pl-9"/>
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, idx) => (
          <motion.div key={p.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: idx*0.03}}>
            <ProductCard product={p} addToCart={addToCart} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, addToCart }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [size, setSize] = useState(product.category==='pizza' ? 'Média' : product.category==='burger' ? '160g' : 'Único');
  const [extraCheese, setExtraCheese] = useState(false);

  const price = useMemo(() => {
    let base = product.price;
    if (product.category==='pizza') {
      if (size==='Pequena') base -= 5;
      if (size==='Grande') base += 8;
    } else if (product.category==='burger') {
      if (size==='200g') base += 5;
    } else {
      // drink: sem modificadores
    }
    if (extraCheese) base += (product.category==='pizza'? 5 : 4);
    return base * qty;
  }, [product, qty, size, extraCheese]);

  return (
                )} className={`px-3 py-2 rounded-xl border ${size===s? 'border-transparent text-white' : ''}`} style={size===s? {backgroundColor: colors.primary} : {}}>{s}</button>
                        ))}   // <-- ISSO ESTÁ REPETIDO
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Extras</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={()=>setExtraCheese(v=>!v)} className={`px-3 py-2 rounded-xl border ${extraCheese? 'border-transparent text-white' : ''}`} style={extraCheese? {backgroundColor: colors.accent} : {}}>Extra queijo</button>
                      </div>
                    </div>
                  </>
                )}
Ou seja: você já tinha fechado o bloco pizza e burger, mas continuou repetindo código.

✅ Aqui está a versão corrigida (sem os duplicados):

jsx
Copiar
Editar
{product.category==='pizza' ? (
  <>
    <div>
      <Label className="text-sm">Tamanho</Label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {['Pequena','Média','Grande'].map(s => (
          <button 
            key={s} 
            onClick={()=>setSize(s)} 
            className={`px-3 py-2 rounded-xl border ${size===s? 'border-transparent text-white' : ''}`} 
            style={size===s? {backgroundColor: colors.primary} : {}}>
            {s}
          </button>
        ))}
      </div>
    </div>
    <div>
      <Label className="text-sm">Extras</Label>
      <div className="mt-2 flex items-center gap-2">
        <button 
          onClick={()=>setExtraCheese(v=>!v)} 
          className={`px-3 py-2 rounded-xl border ${extraCheese? 'border-transparent text-white' : ''}`} 
          style={extraCheese? {backgroundColor: colors.accent} : {}}>
          Extra queijo
        </button>
      </div>
    </div>
  </>
) : product.category==='burger' ? (
  <>
    <div>
      <Label className="text-sm">Peso do smash</Label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {['120g','160g','200g'].map(s => (
          <button 
            key={s} 
            onClick={()=>setSize(s)} 
            className={`px-3 py-2 rounded-xl border ${size===s? 'border-transparent text-white' : ''}`} 
            style={size===s? {backgroundColor: colors.primary} : {}}>
            {s}
          </button>
        ))}
      </div>
    </div>
    <div>
      <Label className="text-sm">Extras</Label>
      <div className="mt-2 flex items-center gap-2">
        <button 
          onClick={()=>setExtraCheese(v=>!v)} 
          className={`px-3 py-2 rounded-xl border ${extraCheese? 'border-transparent text-white' : ''}`} 
          style={extraCheese? {backgroundColor: colors.accent} : {}}>
          Extra queijo
        </button>
      </div>
    </div>
  </>
) : (
  <div className="col-span-2">
    <div className="text-sm text-gray-600">
      Bebidas não possuem personalização.
    </div>
  </div>
)}

function CartPanel({ products, cart, changeQty, removeFromCart, emptyCart, onCheckout }){
  const total = cart.reduce((sum,it)=> sum + (products.find(p=>p.id===it.productId)?.price||0) * it.qty, 0);
  return (
    <div className="space-y-3">
      {cart.length===0 && (
        <Card className="rounded-3xl border-dashed">
          <CardHeader>
            <CardTitle>Seu carrinho está vazio</CardTitle>
            <CardDescription>Adicione itens do cardápio para continuar.</CardDescription>
          </CardHeader>
        </Card>
      )}
      {cart.map((it, idx) => {
        const p = products.find(p=>p.id===it.productId);
        if (!p) return null;
        return (
          <Card key={idx} className="rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl"/>
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-500">{Object.entries(it.options||{}).filter(([,v])=>v!==false && v!=='' && v!==undefined).map(([k,v])=>`${k}: ${v}`).join(' • ')}</div>
                {it.notes && <div className="text-xs text-gray-500">Obs: {it.notes}</div>}
                <div className="mt-1 text-sm">{currency(p.price)} cada</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>changeQty(idx,-1)} className="w-8 h-8 rounded-lg border flex items-center justify-center"><Minus size={14}/></button>
                <div className="w-6 text-center">{it.qty}</div>
                <button onClick={()=>changeQty(idx,1)} className="w-8 h-8 rounded-lg border flex items-center justify-center"><Plus size={14}/></button>
              </div>
              <div className="w-24 text-right font-semibold">{currency(p.price*it.qty)}</div>
              <button onClick={()=>removeFromCart(idx)} className="w-9 h-9 rounded-lg border flex items-center justify-center"><Trash2 size={16}/></button>
            </CardContent>
          </Card>
        );
      })}
      {cart.length>0 && (
        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={emptyCart} className="rounded-2xl">Esvaziar</Button>
          {onCheckout && (
            <Button className="rounded-2xl" onClick={onCheckout} style={{backgroundColor: colors.primary}}>Ir para o checkout – {currency(total)}</Button>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ total, onCheckout }){
  return (
    <Card className="rounded-3xl sticky top-24">
      <CardHeader>
        <CardTitle>Resumo</CardTitle>
        <CardDescription>Revise os itens antes de finalizar.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{currency(total)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full rounded-2xl" disabled={total<=0} onClick={onCheckout} style={{backgroundColor: colors.primary}}>Checkout</Button>
      </CardFooter>
    </Card>
  );
}

function CheckoutPage({ total, profile, setProfile, onPlacePix, onPlaceCard }){
  const [method, setMethod] = useState('PIX');
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const txid = useMemo(()=>uid().slice(0,6).toUpperCase(), []);
  const pixPayload = useMemo(()=> makePixPayload(total, profile.name||'Cliente', 'Cidade', txid), [total, profile.name, txid]);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Dados do cliente</CardTitle>
            <CardDescription>Preencha para entrega e contato.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Nome</Label>
              <Input value={profile.name} onChange={(e)=>setProfile(p=>({...p, name:e.target.value}))} placeholder="Seu nome"/>
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={profile.phone} onChange={(e)=>setProfile(p=>({...p, phone:e.target.value}))} placeholder="(DDD) 9 9999-9999"/>
            </div>
            <div className="md:col-span-2">
              <Label>Endereço</Label>
              <Input value={profile.address} onChange={(e)=>setProfile(p=>({...p, address:e.target.value}))} placeholder="Rua, número, bairro, cidade"/>
            </div>
            <div>
              <Label>WhatsApp (opcional)</Label>
              <Input value={profile.whatsapp||''} onChange={(e)=>setProfile(p=>({...p, whatsapp:e.target.value}))} placeholder="DDD + número"/>
            </div>
            <div>
              <Label>Email (opcional)</Label>
              <Input value={profile.email||''} onChange={(e)=>setProfile(p=>({...p, email:e.target.value}))} placeholder="voce@exemplo.com"/>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Pagamento</CardTitle>
            <CardDescription>Escolha o método de pagamento (simulado).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {['PIX','Cartão'].map(m => (
                <button key={m} onClick={()=>setMethod(m)} className={`px-4 py-2 rounded-2xl border ${method===m? 'border-transparent text-white' : ''}`} style={method===m? {backgroundColor: colors.primary} : {}}>{m}</button>
              ))}
            </div>

            {method==='PIX' ? (
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div className="flex items-center justify-center bg-white rounded-2xl border p-4">
                  <div className="text-center">
                    <QRCodeCanvas value={pixPayload} size={180} includeMargin={true} />
                    <div className="text-sm text-gray-500 mt-2">Escaneie o QR Code para pagar</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Copia e Cola (BR Code simulado)</div>
                  <div className="p-3 rounded-xl bg-gray-100 break-all text-xs select-all">{pixPayload}</div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Número do cartão</Label>
                  <Input value={card.number} onChange={(e)=>setCard(c=>({...c, number:e.target.value}))} placeholder="0000 0000 0000 0000"/>
                </div>
                <div>
                  <Label>Nome impresso</Label>
                  <Input value={card.name} onChange={(e)=>setCard(c=>({...c, name:e.target.value}))} placeholder="NOME DO CARTÃO"/>
                </div>
                <div>
                  <Label>Validade</Label>
                  <Input value={card.expiry} onChange={(e)=>setCard(c=>({...c, expiry:e.target.value}))} placeholder="MM/AA"/>
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input value={card.cvv} onChange={(e)=>setCard(c=>({...c, cvv:e.target.value}))} placeholder="123"/>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-lg font-semibold">Total: {currency(total)}</div>
            {method==='PIX' ? (
              <Button className="rounded-2xl" onClick={onPlacePix} style={{backgroundColor: colors.success}}>
                <QrCode className="mr-2" size={18}/> Confirmar pagamento PIX
              </Button>
            ) : (
              <Button className="rounded-2xl" onClick={()=>onPlaceCard(card)} style={{backgroundColor: colors.success}}>
                <CreditCard className="mr-2" size={18}/> Pagar com cartão
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div>
        <Card className="rounded-3xl sticky top-24">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Confirme os dados e o pagamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{currency(total)}</span>
            </div>
            <div className="mt-3 text-sm text-gray-500 flex items-start gap-2"><MapPin size={16}/> {profile.address || 'Sem endereço'}</div>
            <div className="mt-1 text-sm text-gray-500 flex items-start gap-2"><Smartphone size={16}/> {profile.phone || 'Sem telefone'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrdersPage({ orders, waLinkForOrder }){
  return (
    <div className="space-y-3">
      {orders.length===0 && (
        <Card className="rounded-3xl border-dashed">
          <CardHeader>
            <CardTitle>Você ainda não fez pedidos</CardTitle>
            <CardDescription>Quando fizer, poderá acompanhar o status em tempo real aqui.</CardDescription>
          </CardHeader>
        </Card>
      )}
      {orders.map((o) => (
        <Card key={o.id} className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Pedido #{o.id}</span>
              <Badge className="text-white" style={{backgroundColor: statusColor(o.status)}}>{o.status}</Badge>
            </CardTitle>
            <CardDescription>{new Date(o.createdAt).toLocaleString('pt-BR')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {o.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{it.qty}x</span> {it.productId}
                  {it.notes && <span className="text-gray-500"> – {it.notes}</span>}
                </div>
                <div className="text-gray-600">{Object.entries(it.options||{}).filter(([,v])=>v!==false && v!=='').map(([k,v])=>`${k}: ${v}`).join(' • ')}</div>
              </div>
            ))}
            <div className="pt-2 flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{currency(o.total)}</span>
            </div>
            <div className="text-sm text-gray-500">Pagamento: {o.payment?.method} {o.payment?.cardLast4? `(**** ${o.payment.cardLast4})`: ''}</div>
          </CardContent>
          <CardFooter className="flex items-center gap-2">
            <a href={waLinkForOrder(o)} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-2xl text-white" style={{backgroundColor: colors.success}}>Enviar no WhatsApp</a>
            <Button variant="secondary" className="rounded-2xl" onClick={()=>navigator.clipboard?.writeText(o.payment?.pixPayload||'')}>Copiar PIX</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ProfilePage({ profile, setProfile }){
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Atualize suas informações para facilitar seus pedidos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div>
            <Label>Nome completo</Label>
            <Input value={profile.name} onChange={(e)=>setProfile(p=>({...p, name:e.target.value}))} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={profile.phone} onChange={(e)=>setProfile(p=>({...p, phone:e.target.value}))} />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={profile.address} onChange={(e)=>setProfile(p=>({...p, address:e.target.value}))} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={profile.whatsapp||''} onChange={(e)=>setProfile(p=>({...p, whatsapp:e.target.value}))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={profile.email||''} onChange={(e)=>setProfile(p=>({...p, email:e.target.value}))} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>Defina opções para agilizar o checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-gray-500">Mais preferências serão adicionadas aqui.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function statusColor(status){
  switch(status){
    case 'Recebido': return colors.primary;
    case 'Em preparo': return colors.accent;
    case 'A caminho': return '#3B82F6';
    case 'Entregue': return colors.success;
    case 'Cancelado': return '#6B7280';
    default: return '#9CA3AF';
  }
}
