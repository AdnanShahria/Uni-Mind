
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "UNIMIND’s AI Tutor completely changed how I study for exams. It generates personalized flashcards and quizzes based on my actual lecture notes.",
    author: "Sarah J.",
    role: "Computer Science Student",
    avatar: "bg-gradient-to-tr from-blue-500 to-cyan-400"
  },
  {
    quote: "The semantic search is a lifesaver. Finding exact paragraphs from hundreds of research papers saves me hours of manual reading every week.",
    author: "Dr. Alan T.",
    role: "AI Researcher",
    avatar: "bg-gradient-to-tr from-purple-500 to-pink-500"
  },
  {
    quote: "Managing my batch communities and assigning smart-summarized reading materials has never been more intuitive. It’s the ultimate academic OS.",
    author: "Prof. Elena M.",
    role: "University Lecturer",
    avatar: "bg-gradient-to-tr from-orange-400 to-red-500"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            Trusted by the <span className="text-gradient">Academic World</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See how UNIMIND is revolutionizing the learning and research experience across the globe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="glass-card p-8 rounded-3xl relative group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5 group-hover:text-primary/20 transition-colors duration-500" />
              <p className="text-slate-300 text-lg leading-relaxed mb-8 relative z-10">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${test.avatar} shadow-lg`} />
                <div>
                  <h4 className="text-white font-semibold font-outfit">{test.author}</h4>
                  <span className="text-sm text-slate-400">{test.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
