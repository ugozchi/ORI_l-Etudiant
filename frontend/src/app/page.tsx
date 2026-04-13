import { redirect } from 'next/navigation';

export default function Home() {
  // On redirige automatiquement tous les visiteurs vers /chat
  // (Le middleware se chargera de vérifier s'ils sont connectés, 
  // sinon il les enverra vers /login)
  redirect('/chat');
}
