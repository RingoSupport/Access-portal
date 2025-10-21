// components/LoadingSpinner.jsx
import Lottie from "lottie-react";
import animationData from "../assets/loader.json"; // your downloaded Lottie JSON

export default function LoadingSpinner() {
	return (
		<div className='flex justify-center items-center min-h-[200px]'>
			<Lottie
				animationData={animationData}
				loop={true}
				style={{ height: 100 }}
			/>
		</div>
	);
}
