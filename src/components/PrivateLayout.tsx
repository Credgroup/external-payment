import { Outlet } from "react-router-dom";
import Container from "./Container";

const IMAGE_VERSION = import.meta.env.VITE_IMAGE_VERSION;
const VITE_ENV = import.meta.env.VITE_ENV;

export default function PrivateLayout() {
    return (
        <div className="min-h-screen w-full max-w-screen">
            {/* header */}
            <div className="w-full h-16 border-b border-zinc-200">
                <div className="w-full h-full max-w-screen mx-auto flex items-center justify-between">
                    <Container>
                        <div className="w-20 h-10 bg-[image:var(--image-logo-extended)] bg-contain bg-center bg-no-repeat">
                        </div>
                    </Container>
                </div>
            </div>

            {/* content */}
            <Outlet />

            {/* footer */}
            <div className="w-full h-16 border-t border-zinc-200">
                <div className="w-full h-full max-w-screen mx-auto flex items-center justify-between">
                    <Container>
                    <div className='flex justify-center items-center flex-col'>
                        <span className='text-xs text-zinc-500 w-full text-center'>V{IMAGE_VERSION}</span>
                        {
                            VITE_ENV !== "production" && (
                                <span className='text-xs text-zinc-500 w-full text-center'>{VITE_ENV}</span>
                            )
                        }
                    </div>
                    </Container>
                </div>
            </div>
        </div>
    )
}