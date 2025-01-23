'use client';
import StoreNavsBar from '@/components/stores-navbar';
import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Dot } from 'lucide-react';
import baristaPic from '/public/illustrations/barista.svg';
import Image from 'next/image';
// import { getStoreOrders } from '@/db/queries/select';
// import { init } from 'next/dist/compiled/webpack/webpack';
// import next from 'next';

interface Item {
    id: number;
    name: string;
    due_date: string;
    qty_per_order: string;
    order: number | null;
    store_categ: string;
    status: string;
}

const STORE_CATEGORIES = [
    'ALL',
    'PASTRY',
    'FRONT',
    'GENERAL',
    'FRIDGE',
    'STOCKROOM',
    'BEANS&TEA',
] as const;

export default function Stores() {
    const [data, setData] = useState<Item[]>([]);
    // const [ storeData, setStoreData ] = useState<Item[]>([]);
    const [activeCateg, setActiveCateg] = useState<string>('PASTRY');

    // Accepts integers only
    const OrderCell = ({ getValue, row, column, table }) => {
        const initialValue = getValue();
        const [value, setValue] = useState<string>(
            initialValue?.toString() ?? ''
        );
        // const inputRef = useRef<HTMLInputElement>(null);

        const handleBlur = () => {
            const numValue = value === '' ? null : parseInt(value);
            table.options.meta?.updateData(row.index, column.id, numValue);

            // table.options.meta?.updateData(row.index, column.id, value);
        };

        const focusNextInput = (currentRowIndex: number) => {
            const nextRowIndex = currentRowIndex + 1;

            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                try {
                    // Try to find next input directly by row index
                    const nextInput = document.querySelector(
                        `input[data-row-index="${nextRowIndex}"][data-column-id="${column.id}"]`
                    ) as HTMLInputElement;

                    if (nextInput) {
                        nextInput.focus();
                        nextInput.select(); // Optional: select the text
                    } else {
                        console.log('No next input found');
                    }
                } catch (error) {
                    console.error('Focus error:', error);
                }
            }, 10);
        };

        const handleKeyDown = (
            event: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (event.key === 'Enter' || event.key === 'Tab') {
                event.preventDefault();
                event.stopPropagation();

                // Save the current value
                const numValue = value === '' ? null : parseInt(value);
                table.options.meta?.updateData(row.index, column.id, numValue);

                // Focus next input
                focusNextInput(row.index);
            }
        };

        return (
            <Input
                type='number'
                // ref={inputRef}
                // value={value}
                // value={value ?? ''}
                value={value !== null ? value : ''}
                onChange={(e) =>
                    e.target.value.includes('.')
                        ? setValue('')
                        : setValue(e.target.value)
                }
                // onKeyDown=""
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                data-row-index={row.index}
                data-column-id={column.id}
                className='h-6 text-center'
                min='0'
                // step="0.5"
                placeholder='0'
            />
        );
    };

    const columns = [
        {
            accessorKey: 'name', // accessorKey matches to the property name in initialData[], thereby rendering the appropriate data
            header: 'Name',
        },
        {
            accessorKey: 'due_date',
            header: 'Due Date',
        },
        {
            accessorKey: 'qty_per_order',
            header: 'Qty/Order',
        },
        {
            accessorKey: 'order',
            header: 'Order',
            // size: 200,
            cell: OrderCell,
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: activeCateg === 'ALL' ? undefined : activeCateg,
        },
        globalFilterFn: (row, columnId, filterValue) => {
            return row.original.store_categ === filterValue;
        },
        meta: {
            updateData: (rowIndex, columnId, value) => {
                setData((old) =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...old[rowIndex],
                                [columnId]: value,
                            };
                        }
                        return row;
                    })
                );
            },
        },
    });

    // object lookup for category messages
    const categoryMessage: Record<string, JSX.Element | string> = {
        ALL: '',
        PASTRY: <p>Pastry item orders due everyday</p>,
        FRONT: <p>Front counter items</p>,
        GENERAL: <p>General items</p>,
        STOCKROOM: <p>Items in stockroom and its shelves</p>,
        FRIDGE: <p>Items in all fridges and freezers</p>,
        'BEANS&TEA': <p>Coffee bean and tea items</p>,
    };

    // render red dot if any item is due in the category
    function renderRedDot(category: string) {
        const items = data.filter((item) => item.store_categ === category);

        if (items.length > 0) {
            // Check if any item has status 'DUE'
            const hasDueItems = items.some((item) => item.status === 'DUE');
            if (hasDueItems) {
                return (
                    // <p>test</p>
                    // <div className='bg-red-500 rounded-full w-2 h-2 absolute top-0 right-0'></div>
                    <Dot className='text-red-500 w-8 h-8' />
                );
            }
        }
        return <div></div>;
    }

    useEffect(() => {
        const fetchStoreOrders = async () => {
            try {
                // fetch every store (no storeId param in api url)
                const response = await fetch('/api/v1/store-orders?storeId=2');
                const data = await response.json();
                if (response.ok) {
                    setData(data); // set data to all stores
                    // setStoreData(data);
                } else {
                    console.error('Error fetching store orders:', data);
                    setData([]);
                    // setStoreData([]);
                }
            } catch (error) {
                console.error('Error fetching store orders:', error);
                setData([]);
                // setStoreData([]);
            }
        };

        // fetchStoreOrders();
    }, []);

    return (
        <div className='mt-6'>
            <div>
                <h1 className='text-3xl'>Store</h1>
            </div>
            <div>
                <StoreNavsBar />
            </div>
            {data?.length > 0 ? (
                <>
                    <div className='mb-4 flex flex-wrap gap-2'>
                        {STORE_CATEGORIES.map((category) => (
                            <div
                                key={category}
                                className='flex flex-col items-center'
                            >
                                {/* {renderRedDot(category)} */}
                                <Button
                                    key={category}
                                    variant={
                                        activeCateg === category
                                            ? 'myTheme'
                                            : 'outline'
                                    }
                                    onClick={() => setActiveCateg(category)}
                                    // className='min-w-[100px]'
                                >
                                    {category}
                                </Button>
                                <div>{renderRedDot(category)}</div>
                            </div>
                        ))}
                    </div>
                    <div className='mb-2 text-sm'>
                        {categoryMessage[activeCateg]}
                    </div>
                    <div className='flex flex-col mr-2'>
                        <div className='rounded-lg border'>
                            <Table>
                                <TableHeader className='bg-gray-200'>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <TableHead
                                                            key={header.id}
                                                            style={{
                                                                width:
                                                                    header.id ===
                                                                    'order'
                                                                        ? '130px'
                                                                        : 'auto',
                                                            }}
                                                        >
                                                            {flexRender(
                                                                header.column
                                                                    .columnDef
                                                                    .header,
                                                                header.getContext()
                                                            )}
                                                        </TableHead>
                                                    )
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        style={{
                                                            width:
                                                                cell.column
                                                                    .id ===
                                                                'order'
                                                                    ? '130px'
                                                                    : 'auto',
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div>
                            {' '}
                            {/* Pagination: 10 items per page */}
                            <div className='flex items-center justify-end space-x-2 py-4'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className='flex flex-col justify-center'>
                    <div className='flex flex-col items-center gap-2'>
                        <Image
                            src={baristaPic}
                            alt='complete'
                            width={200}
                            height={200}
                        />
                        <p className="text-xl text-gray-400">No orders due!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
