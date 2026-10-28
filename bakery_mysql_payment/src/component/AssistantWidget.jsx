import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiArrowRightLine,
  RiCloseLine,
  RiSendPlane2Line,
} from "react-icons/ri";
import { StoreContext } from "../contaxt/StoreContext";
import assistantBot from "../assets/assistant-bot.svg";

const QUICK_QUESTIONS = [
  "How do I place an order?",
  "What payment options do I have?",
  "How can I track my order?",
];

const AssistantWidget = () => {
  const { cartItems, food_list, getTotalAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [launcherPosition, setLauncherPosition] = useState(() => {
    try {
      const saved = localStorage.getItem("bakery-help-position");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I can help with the bakery menu, your cart, checkout, payments, and order tracking. What do you need?",
    },
  ]);

  const cartSummary = useMemo(() => {
    const count = Object.values(cartItems).reduce(
      (sum, quantity) => sum + Number(quantity || 0),
      0
    );
    return { count, total: getTotalAmount() };
  }, [cartItems, getTotalAmount]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages]);

  useEffect(() => {
    if (!launcherPosition) return;
    try {
      localStorage.setItem("bakery-help-position", JSON.stringify(launcherPosition));
    } catch {
      // Keep the current position for this session when storage is unavailable.
    }
  }, [launcherPosition]);

  useEffect(() => () => {
    const drag = dragRef.current;
    if (drag) {
      window.removeEventListener("pointermove", drag.move);
      window.removeEventListener("pointerup", drag.finish);
      window.removeEventListener("pointercancel", drag.finish);
    }
  }, []);

  const getReply = (question) => {
    const text = question.toLowerCase();

    if (/track|status|where.*order|order.*where/.test(text)) {
      return {
        text: "Open Track Order and enter the order ID from your confirmation. You can also search past orders from My Orders using your email or phone.",
        action: { label: "Track an order", path: "/track-order" },
      };
    }

    if (/payment|pay|cod|cash|qr|razor|online/.test(text)) {
      return {
        text: "At checkout, choose Cash on Delivery, QR payment, or online payment. Online payment needs the shop’s payment setup to be active.",
        action: { label: "Go to checkout", path: cartSummary.count ? "/order" : "/menu" },
      };
    }

    if (/cart|bag|basket/.test(text)) {
      if (cartSummary.count === 0) {
        return {
          text: "Your cart is empty right now. Browse the menu and tap the plus button on anything you like.",
          action: { label: "Explore the menu", path: "/menu" },
        };
      }
      return {
        text: `You have ${cartSummary.count} ${cartSummary.count === 1 ? "item" : "items"} in your cart, totalling ₹${Number(cartSummary.total).toFixed(2)}. You can change quantities before checkout.`,
        action: { label: "View my cart", path: "/cart" },
      };
    }

    if (/menu|food|item|product|cake|bread|roll|price|available/.test(text)) {
      const categories = [...new Set(food_list.map((item) => item.category))];
      return {
        text: `The menu has ${food_list.length} items across ${categories.join(", ")}. Open the menu to browse photos, prices, and add items to your cart.`,
        action: { label: "Browse the menu", path: "/menu" },
      };
    }

    if (/checkout|order|buy|place/.test(text)) {
      if (cartSummary.count === 0) {
        return {
          text: "First add a treat to your cart. Then open checkout to enter delivery details and choose a payment method.",
          action: { label: "Choose something tasty", path: "/menu" },
        };
      }
      return {
        text: "Your cart is ready. At checkout, enter your delivery details and choose COD, QR, or online payment.",
        action: { label: "Continue to checkout", path: "/order" },
      };
    }

    if (/problem|issue|error|fail|not work|stuck/.test(text)) {
      return {
        text: "Sorry you’re running into trouble. Check that all checkout fields are filled in, then try again. If payment was taken but the order is missing, keep the payment reference and contact the bakery.",
        action: { label: "Review my cart", path: "/cart" },
      };
    }

    return {
      text: "I can guide you around the bakery site. Ask me about the menu, cart, checkout, payment options, or order tracking.",
    };
  };

  const sendMessage = (value = draft) => {
    const question = value.trim();
    if (!question) return;

    const userMessage = { id: Date.now(), role: "user", text: question };
    const reply = getReply(question);
    setMessages((current) => [
      ...current,
      userMessage,
      { id: Date.now() + 1, role: "assistant", ...reply },
    ]);
    setDraft("");
  };

  const followAction = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLauncherPointerDown = (event) => {
    if (event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: bounds.left,
      startTop: bounds.top,
      size: bounds.width,
    };
    movedRef.current = false;
    drag.move = (moveEvent) => {
      if (moveEvent.pointerId !== drag.pointerId) return;
      const deltaX = moveEvent.clientX - drag.startX;
      const deltaY = moveEvent.clientY - drag.startY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 3) movedRef.current = true;
      if (!movedRef.current) return;

      const left = Math.max(8, Math.min(drag.startLeft + deltaX, window.innerWidth - drag.size - 8));
      const top = Math.max(8, Math.min(drag.startTop + deltaY, window.innerHeight - drag.size - 8));
      setLauncherPosition({ left, top });
    };
    drag.finish = (upEvent) => {
      if (upEvent.pointerId !== drag.pointerId) return;
      window.removeEventListener("pointermove", drag.move);
      window.removeEventListener("pointerup", drag.finish);
      window.removeEventListener("pointercancel", drag.finish);
      dragRef.current = null;
    };
    dragRef.current = drag;
    window.addEventListener("pointermove", drag.move);
    window.addEventListener("pointerup", drag.finish);
    window.addEventListener("pointercancel", drag.finish);
  };

  return (
    <div
      className={`assistant-widget ${launcherPosition ? "assistant-widget-moved" : ""}`}
      style={launcherPosition ? {
        left: launcherPosition.left,
        top: launcherPosition.top,
        right: "auto",
        bottom: "auto",
      } : undefined}
    >
      {isOpen && (
        <section className="assistant-panel" aria-label="Bakery help chat">
          <header className="assistant-header">
            <div className="assistant-avatar"><img src={assistantBot} alt="" /></div>
            <div className="assistant-title">
              <strong>Bakery help</strong>
              <span><i /> Here to help with your order</span>
            </div>
            <button
              className="assistant-close-button"
              type="button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              <RiCloseLine aria-hidden="true" />
            </button>
          </header>

          <div className="assistant-messages" aria-live="polite">
            {messages.map((message) => (
              <div className={`assistant-message assistant-message-${message.role}`} key={message.id}>
                <p>{message.text}</p>
                {message.action && (
                  <button type="button" onClick={() => followAction(message.action.path)}>
                    {message.action.label} <RiArrowRightLine aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="assistant-quick-questions">
                <span>QUICK QUESTIONS</span>
                {QUICK_QUESTIONS.map((question) => (
                  <button type="button" key={question} onClick={() => sendMessage(question)}>
                    {question}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="assistant-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              aria-label="Ask the bakery helper"
              placeholder="Type your question..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim()}>
              <RiSendPlane2Line aria-hidden="true" />
            </button>
          </form>
          <p className="assistant-footnote">Built-in help · No external AI service connected</p>
        </section>
      )}

      <button
        className={`assistant-launcher ${isOpen ? "assistant-launcher-open" : ""}`}
        type="button"
        aria-label={isOpen ? "Close bakery help" : "Open bakery help"}
        aria-expanded={isOpen}
        onPointerDown={handleLauncherPointerDown}
        onClick={() => {
          if (movedRef.current) {
            movedRef.current = false;
            return;
          }
          setIsOpen((open) => !open);
        }}
      >
        {isOpen ? <RiCloseLine aria-hidden="true" /> : <img className="assistant-launcher-mascot" src={assistantBot} alt="" />}
      </button>
    </div>
  );
};

export default AssistantWidget;
