import {
  Bird, Book, Brain, Briefcase, Cat, Clock, Cloud, Dog, Ear, Eye, Fish,
  Flower, Hand, HandHeart, Heart, Home, Lightbulb, Leaf, Map, MessageCircle,
  Moon, Music, Smile, Star, Sun, Users, Wind, Zap,
} from 'lucide-react';

// Registry of vocabulary icons (used when a word has no fitting emoji).
// Add entries here as items.json references new icon names.
const ICONS = {
  bird: Bird, book: Book, brain: Brain, briefcase: Briefcase, cat: Cat,
  clock: Clock, cloud: Cloud, dog: Dog, ear: Ear, eye: Eye, fish: Fish,
  flower: Flower, hand: Hand, 'hand-heart': HandHeart, heart: Heart,
  home: Home, lightbulb: Lightbulb, leaf: Leaf, map: Map,
  'message-circle': MessageCircle, moon: Moon, music: Music, smile: Smile,
  star: Star, sun: Sun, users: Users, wind: Wind, zap: Zap,
};

// Renders a word's visual: a Lucide icon when `data.icon` is set, else the
// emoji. Sized in `em` so it scales with the surrounding text-size class.
export default function Glyph({ data, className = '' }) {
  const Icon = data?.icon ? ICONS[data.icon] : null;
  if (Icon) {
    return (
      <Icon
        aria-hidden="true"
        strokeWidth={2.25}
        className={`inline-block h-[0.9em] w-[0.9em] align-[-0.1em] ${className}`}
      />
    );
  }
  return <>{data?.emoji ?? '✨'}</>;
}
