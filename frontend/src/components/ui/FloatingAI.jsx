import { BrainCircuit } from "lucide-react";

import { motion } from "framer-motion";

export default function FloatingAI(){

return(

<motion.button

initial={{
scale:0
}}

animate={{
scale:1
}}

whileHover={{
scale:1.1
}}

whileTap={{
scale:.9
}}

className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-2xl z-50"

>

<BrainCircuit

className="mx-auto text-white"

/>

</motion.button>

)

}