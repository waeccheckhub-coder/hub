import { MessageCircle } from 'lucide-react';

export default function WhatsAppIcon() {
  const phoneNumber = "233XXXXXXXXX"; // Replace with your actual WhatsApp number
  const message = "Hello! I need help with my voucher purchase.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:bg-[#20ba5a] transition-all duration-300 group"
      aria-label="Contact support on WhatsApp"
    >
      {/* Tooltip hint that appears on hover */}
      <span className="absolute right-16 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
        Need help? Chat with us
      </span>
      
      <MessageCircle size={30} fill="currentColor" />
    </a>
  );
}
