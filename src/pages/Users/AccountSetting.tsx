import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import IconHome from '../../components/Icon/IconHome';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

const AccountSetting = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Account Setting'));
    }, [dispatch]);

    const [tabs, setTabs] = useState<string>('home');
    const toggleTabs = (name: string) => {
        setTabs(name);
    };

    const [users, setUsers] = useState({});
    const [input, setInput] = useState({
        email: '',
        name: '',
        password: '',
        password_confirmation: '',
    });

    let getUser = () => {
        axios
            .get('https://backend-uki.project-adit.my.id/api/get-profile', {
                headers: { Authorization: 'Bearer ' + Cookies.get('token') },
            })
            .then((res) => {
                const { data } = res.data;
                setUsers(data);
                setInput({ ...data });
            })
            .catch((err) => alert(err.message));
    };

    const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setInput({ ...input, [name]: value });
    };

    useEffect(() => {
        getUser();
    }, []);

    const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await axios
            .patch(
                `https://backend-uki.project-adit.my.id/api/update-profile`,
                {
                    email: input.email,
                    name: input.name,
                    password: input.password,
                    password_confirmation: input.password_confirmation,
                },
                {
                    headers: { Authorization: 'Bearer ' + Cookies.get('token') },
                }
            )
            .then((res) => {
                getUser();
                Swal.fire({
                    title: 'Updated!',
                    text: 'Data profile berhasil diupdate.',
                    icon: 'success',
                });
            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Profile
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Account Settings</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Settings</h5>
                </div>
                <div>
                    <ul className="sm:flex font-semibold border-b border-[#ebedf2] dark:border-[#191e3a] mb-5 whitespace-nowrap overflow-y-auto">
                        <li className="inline-block">
                            <button
                                onClick={() => toggleTabs('home')}
                                className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}
                            >
                                <IconHome />
                                Home
                            </button>
                        </li>
                    </ul>
                </div>
                <div>
                    <form onSubmit={saveEdit} className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black">
                        <h6 className="text-lg font-bold mb-5">General Information</h6>
                        <div className="flex flex-col sm:flex-row">
                            <div className="ltr:sm:mr-4 rtl:sm:ml-4 w-full sm:w-2/12 mb-5">
                                <img src="/assets/images/profile-34.jpeg" alt="img" className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto" />
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="name">Full Name</label>
                                    <input id="name" name="name" type="text" onChange={inputHandler} value={input.name} className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="email">Email</label>
                                    <input id="email" name="email" type="email" onChange={inputHandler} value={input.email} className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="password">Password</label>
                                    <input id="password" name="password" type="password" placeholder="**********" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="password_confirmation">Confirm Password</label>
                                    <input id="password_confirmation" name="password_confirmation" type="password" placeholder="**********" className="form-input" />
                                </div>
                                <div className="sm:col-span-2 mt-3">
                                    <button type="submit" className="btn btn-primary">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountSetting;
