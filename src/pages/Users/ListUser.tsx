import { Link } from 'react-router-dom';
import { Fragment, useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import IconUser from '../../components/Icon/IconUser';
import sortBy from 'lodash/sortBy';
import { IRootState } from '../../store';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconPlus from '../../components/Icon/IconPlus';
import IconX from '../../components/Icon/IconX';
import IconAt from '../../components/Icon/IconAt';
import IconLock from '../../components/Icon/IconLock';
import axios, { AxiosResponse } from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

interface User {
    id: number;
    name: string;
    email: string;
}

interface ActionButtonsProps {
    id: number;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ id, onEdit, onDelete }) => (
    <div className="flex gap-1">
        <button className="btn btn-secondary" onClick={() => onEdit(id)}>
            Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(id)}>
            Delete
        </button>
    </div>
);

const ListUser = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('List'));
    }, [dispatch]);

    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<User[]>([]);
    const [recordsData, setRecordsData] = useState<User[]>([]);
    const [dataEdit, setDataEdit] = useState<User>({
        id: 0,
        email: '',
        name: '',
    });
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [modal, setModal] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [input, setInput] = useState({
        email: '',
        name: '',
        password: '',
        password_confirmation: '',
    });

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setInput({ ...input, [name]: value });
    };

    const inputEditHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setDataEdit({ ...dataEdit, [name]: value });
    };

    const getUser = () => {
        axios
            .get('https://backend-uki.project-adit.my.id/api/user/list', {
                headers: { Authorization: 'Bearer ' + Cookies.get('token') },
            })
            .then((res) => {
                const { data } = res.data;
                setUsers(data);
                setInitialRecords(data);
                setRecordsData(data.slice(0, pageSize)); // Menampilkan halaman pertama
            })
            .catch((err) => alert(err.message));
    };

    const addUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios
            .post('https://backend-uki.project-adit.my.id/api/user/create', input, {
                headers: { Authorization: 'Bearer ' + Cookies.get('token') },
            })
            .then(() => {
                setInput({
                    email: '',
                    name: '',
                    password: '',
                    password_confirmation: '',
                });
                getUser();
                setModal(false);
                Swal.fire({
                    icon: 'success',
                    title: 'User berhasil ditambahkan',
                });
            })
            .catch((err) => {
                Swal.fire({
                    icon: 'warning',
                    title: err.response.data.response_message,
                    text: err.response.data.error,
                });
            });
    };

    const handleEdit = async (id: number) => {
        setModalEdit(true);
        const res = await axios.get(`https://backend-uki.project-adit.my.id/api/user/list/${id}`, {
            headers: { Authorization: 'Bearer ' + Cookies.get('token') },
        });
        const { data } = res.data;
        setDataEdit({ ...data });
    };

    const saveEdit = async (id: number, e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await axios
            .patch(
                `https://backend-uki.project-adit.my.id/api/user/update/${id}`,
                {
                    email: dataEdit.email,
                    name: dataEdit.name,
                },
                { headers: { Authorization: 'Bearer ' + Cookies.get('token') } }
            )
            .then(() => {
                getUser();
                setDataEdit({ id: 0, email: '', name: '' });
                Swal.fire({
                    title: 'Updated!',
                    text: 'Data user berhasil diupdate.',
                    icon: 'success',
                });
            })
            .catch((err) => alert(err));
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`https://backend-uki.project-adit.my.id/api/user/delete/${id}`, {
                        headers: { Authorization: 'Bearer ' + Cookies.get('token') },
                    })
                    .then(() => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'User has been deleted.',
                            icon: 'success',
                        });
                        getUser();
                    })
                    .catch(() => {
                        Swal.fire({
                            title: 'Failed!',
                            text: 'Failed to delete.',
                            icon: 'warning',
                        });
                    });
            }
        });
    };

    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const filteredUsers = users.filter((item) => {
            return (
                item.id.toString().includes(search.toLowerCase()) ||
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.email.toLowerCase().includes(search.toLowerCase())
            );
        });
        setInitialRecords(filteredUsers);
        setPage(1);
    }, [search, users]);

    useEffect(() => {
        const sortedData = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? sortedData.reverse() : sortedData);
        setPage(1);
    }, [sortStatus, initialRecords]);

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Pengguna
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>List Akun</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">List</h5>
                </div>
            </div>
            <div>
                <Transition appear show={modalEdit} as={Fragment}>
                    <Dialog
                        as="div"
                        open={modalEdit}
                        onClose={() => {
                            setModalEdit(false);
                        }}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0" />
                        </Transition.Child>
                        <div id="register_modal" className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                            <div className="flex min-h-screen items-start justify-center px-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="panel my-8 w-full max-w-sm overflow-hidden rounded-lg border-0 py-1 px-4 text-black dark:text-white-dark">
                                        <div className="flex items-center justify-between p-5 text-lg font-semibold dark:text-white">
                                            <h5>Edit Anggota</h5>
                                            <button type="button" onClick={() => setModalEdit(false)} className="text-white-dark hover:text-dark">
                                                <IconX className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="p-5">
                                            <form onSubmit={(event) => saveEdit(dataEdit.id, event)}>
                                                <div className="relative mb-4">
                                                    <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                                                        <IconUser className="w-5 h-5" />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={dataEdit.name}
                                                        placeholder="Name"
                                                        className="form-input ltr:pl-10 rtl:pr-10"
                                                        id="name"
                                                        name="name"
                                                        onChange={inputEditHandler}
                                                    />
                                                </div>
                                                <div className="relative mb-4">
                                                    <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                                                        <IconAt />
                                                    </span>
                                                    <input
                                                        value={dataEdit.email}
                                                        type="email"
                                                        placeholder="Email"
                                                        className="form-input ltr:pl-10 rtl:pr-10"
                                                        id="email"
                                                        name="email"
                                                        onChange={inputEditHandler}
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary w-full">
                                                    Tambah
                                                </button>
                                            </form>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
            <div className="panel mt-6">
                <div>
                    {Cookies.get("role")=="admin" ? (<button
                        type="button"
                        className="btn btn-primary flex"
                        onClick={() => {
                            setModal(true);
                        }}
                    >
                        <IconPlus className="w-5 h-5 ltr:mr-3 rtl:ml-3" />
                        Tambah Anggota
                    </button>):('')}
                    
                    <Transition appear show={modal} as={Fragment}>
                        <Dialog
                            as="div"
                            open={modal}
                            onClose={() => {
                                setModal(false);
                            }}
                        >
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0" />
                            </Transition.Child>
                            <div id="register_modal" className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                                <div className="flex min-h-screen items-start justify-center px-4">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel className="panel my-8 w-full max-w-sm overflow-hidden rounded-lg border-0 py-1 px-4 text-black dark:text-white-dark">
                                            <div className="flex items-center justify-between p-5 text-lg font-semibold dark:text-white">
                                                <h5>Daftar Anggota Baru</h5>
                                                <button type="button" onClick={() => setModal(false)} className="text-white-dark hover:text-dark">
                                                    <IconX className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="p-5">
                                                <form onSubmit={addUser}>
                                                    <div className="relative mb-4">
                                                        <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                                                            <IconUser className="w-5 h-5" />
                                                        </span>
                                                        <input type="text" placeholder="Name" className="form-input ltr:pl-10 rtl:pr-10" id="name" name="name" onChange={inputHandler} />
                                                    </div>
                                                    <div className="relative mb-4">
                                                        <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                                                            <IconAt />
                                                        </span>
                                                        <input type="email" placeholder="Email" className="form-input ltr:pl-10 rtl:pr-10" id="email" name="email" onChange={inputHandler} />
                                                    </div>
                                                    <div className="relative mb-4">
                                                        <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                                                            <IconLock className="w-5 h-5" />
                                                        </span>
                                                        <input
                                                            type="password"
                                                            placeholder="Password"
                                                            className="form-input ltr:pl-10 rtl:pr-10"
                                                            id="password"
                                                            name="password"
                                                            onChange={inputHandler}
                                                        />
                                                    </div>
                                                    <div className="relative mb-4">
                                                        <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                                                            <IconLock className="w-5 h-5" />
                                                        </span>
                                                        <input
                                                            type="password"
                                                            placeholder="Confirm Password"
                                                            className="form-input ltr:pl-10 rtl:pr-10"
                                                            id="password_confirmation"
                                                            name="password_confirmation"
                                                            onChange={inputHandler}
                                                        />
                                                    </div>
                                                    <button type="submit" className="btn btn-primary w-full">
                                                        Tambah
                                                    </button>
                                                </form>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'whitespace-nowrap table-hover text-center' : 'whitespace-nowrap table-hover text-center'}`}
                        records={recordsData}
                        columns={Cookies.get("role")=="admin"?([
                            { accessor: 'id', title: 'ID', sortable: true },
                            { accessor: 'name', title: 'Nama', sortable: true },
                            { accessor: 'email', sortable: true },
                            { accessor: 'action', title: 'Action', render: (record) => <ActionButtons id={record.id} onEdit={handleEdit} onDelete={handleDelete} /> },
                        ]):([
                            { accessor: 'id', title: 'ID', sortable: true },
                            { accessor: 'name', title: 'Nama', sortable: true },
                            { accessor: 'email', sortable: true },
                        ])}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ListUser;
