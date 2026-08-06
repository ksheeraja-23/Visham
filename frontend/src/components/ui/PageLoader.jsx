import { HashLoader } from "react-spinners";

export default function PageLoader(){

return(

<div className="fixed inset-0 bg-slate-950 flex flex-col justify-center items-center">

<HashLoader
color="#3b82f6"
size={80}
/>

<h1 className="text-white text-3xl mt-8 font-bold">

Loading Investigation System...

</h1>

<p className="text-slate-500 mt-3">

Initializing AI Engine

</p>

</div>

)

}