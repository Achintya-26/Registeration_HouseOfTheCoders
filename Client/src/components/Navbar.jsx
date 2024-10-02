import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import { Label } from "./ui/Label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/Dialog";
import toast from 'react-hot-toast';

export default function Navbar({ isMember, setIsMember, memberId, setMemberId }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const onSubmit = async (data) => {
        // console.log(data);
        try {
            const response = await fetch('http://192.168.1.9:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Invalid login credentials');
            }

            toast.success("Welcome! Member You are eligible for the discounted prize",
                { duration: 4000 }
            )

            const csiId = data.csiId

            // console.log('csi id of user', csiId);
            setMemberId(csiId);

            // console.log("member id from navbar : ", memberId);

            const responseData = await response.json();
            setIsLoggedIn(true);
            setIsMember(responseData.isMember);

            setIsDialogOpen(false);
        } catch (error) {
            console.error('Login failed:', error);
            toast.error("Wrong Credentials OR you might have already registered")
        }
    };

    const CSIMemberButton = () => (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hover:bg-yellow-100 w-full sm:w-auto">
                    Are you a member of CSI?
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-yellow-200">
                <DialogHeader>
                    <DialogTitle>CSI Member Login</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            Phone
                        </Label>
                        <Input
                            id="phone"
                            {...register("phone", {
                                required: "Phone number is required",
                                pattern: {
                                    value: /^\d{10}$/,
                                    message: "Please enter a valid 10-digit phone number"
                                }
                            })}
                            placeholder="12345-67890"
                            className="col-span-3"
                        />
                        {errors.phone && <p className="text-red-500 text-sm col-span-4">{errors.phone.message}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="csi-id" className="text-right">
                            CSI ID
                        </Label>
                        <Input
                            id="csi-id"
                            {...register("csiId", {
                                required: "CSI ID is required",
                                minLength: {
                                    value: 5,
                                    message: "CSI ID must be at least 5 characters long"
                                }
                            })}
                            placeholder="8 digits CSI id"
                            className="col-span-3"
                        />
                        {errors.csiId && <p className="text-red-500 text-sm col-span-4">{errors.csiId.message}</p>}
                    </div>
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </DialogContent>
        </Dialog>
    );

    return (
        <nav className="bg-darkBrown-700 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex flex-col sm:flex-row ${isLoggedIn || isMember ? 'justify-center' : 'justify-between'} items-center py-4 sm:h-16`}>
                    <div className={`flex-shrink-0 flex items-center mb-4 sm:mb-0 ${isLoggedIn || isMember ? 'sm:mb-0' : 'sm:mr-4'}`}>
                        <span className="text-3xl font-bold text-yellow-200 text-center">HOUSE OF THE CODERS</span>
                    </div>
                    {!isLoggedIn && !isMember && (
                        <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
                            <div className="w-full sm:w-auto mt-4 sm:mt-0">
                                <CSIMemberButton />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}