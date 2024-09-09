import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import axios from 'axios';
import Cookies from 'js-cookie';
import IconRefresh from '../../components/Icon/IconRefresh';
import Swal from 'sweetalert2';

// Definisikan tipe untuk record currency
interface CurrencyRecord {
    name: string;
    value: number | string; // Ganti 'any' dengan tipe data yang lebih spesifik
}

const Currency = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Currency Table'));
    }, [dispatch]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [currency, setCurrency] = useState<CurrencyRecord[]>([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<CurrencyRecord[]>([]);
    const [recordsData, setRecordsData] = useState<CurrencyRecord[]>([]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'name', direction: 'asc' });
    const [isSpinning, setIsSpinning] = useState(false);

    const fetchCurrency = () => {
        setIsSpinning(true);
        axios
            .post('https://backend-uki.project-adit.my.id/api/currency/fetch', {}, {
                headers: { Authorization: 'Bearer ' + Cookies.get('token') }
            })
            .then(() => {
                getCurrency();
                setIsSpinning(false);
            })
            .catch((err) => {
                setIsSpinning(false);
                const responseCode = err.response?.data?.response_code || 'Unknown Error';
                const responseMessage = err.response?.data?.response_message || 'Something went wrong';
                Swal.fire({
                    icon: 'warning',
                    title: `${responseCode}`,
                    text: `${responseMessage}`,
                });
            });
    };

    const getCurrency = () => {
        axios
            .get('https://backend-uki.project-adit.my.id/api/currency/get-currency', {
                headers: { Authorization: 'Bearer ' + Cookies.get('token') }
            })
            .then((res) => {
                const data = res.data.data;
                const formattedData = Object.keys(data).map((key) => ({
                    name: key,
                    value: data[key]
                }));
                setCurrency(formattedData);
                setInitialRecords(formattedData);
                setRecordsData(formattedData.slice(0, pageSize));
            })
            .catch((err) => {
                const errorMessage = err.response?.data?.response_message || 'Failed to fetch currency data';
                Swal.fire({
                    icon: 'warning',
                    title: 'Error',
                    text: errorMessage,
                });
            });
    };

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData(initialRecords.slice(from, to));
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const filteredRecords = currency.filter((item) => 
            item.name.toLowerCase().includes(search.toLowerCase())
        );
        setInitialRecords(filteredRecords);
    }, [search, currency]);

    useEffect(() => {
        const sortedData = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? sortedData.reverse() : sortedData);
        setPage(1);
    }, [sortStatus]);

    useEffect(() => {
        getCurrency();
    }, []);

    return (
        <div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spinning {
                    animation: spin 1s linear infinite;
                }
            `}</style>
            {Cookies.get("role") === "admin" && (
                <button
                    type="button"
                    className="btn btn-primary flex"
                    onClick={fetchCurrency}
                >
                    <IconRefresh
                        className={`w-5 h-5 ltr:mr-3 rtl:ml-3 ${isSpinning ? 'spinning' : ''}`}
                    />
                </button>
            )}
            
            <div className="panel mt-6">
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Currency</h5>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                        records={recordsData}
                        columns={[
                            { accessor: 'name', title: 'Currency', sortable: true },
                            { accessor: 'value', title: 'Value', sortable: true },
                        ]}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default Currency;
