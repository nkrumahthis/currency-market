"use client"

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserType } from '@prisma/client';
import { fetchUsers } from './actions';

interface User {
    id: string;
    name: string;
    email: string;
    type: UserType;
    createdAt: string;
}

export default function UsersPage() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        async function loadUsers() {
            // Fetch users from the backend
            const users = await fetchUsers();
            setUsers(users);
        }

        loadUsers();
    }, [])

    const columns = [
        {
            header: 'Name',
            accessorKey: 'name',
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'Type',
            accessorKey: 'type',
            cell: (row: User) => (
                <Badge variant={
                    row.type === 'ADMIN' ? 'default' :
                        row.type === 'PARTNER' ? 'secondary' : 'outline'
                }>
                    {row.type}
                </Badge>
            ),
        },
        {
            header: 'Created At',
            accessorKey: 'createdAt',
            cell: (row: User) => new Date(row.createdAt).toLocaleDateString(),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage user accounts and permissions
                    </p>
                </div>
                <Button onClick={() => { }}>Create User</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all users in your system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={users}
                        columns={columns}
                        onView={(user) => setSelectedUser(user)}
                        onEdit={(user) => { }}
                        onDelete={(user) => { }}
                    />
                </CardContent>
            </Card>

            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Basic Information</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium">{selectedUser.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{selectedUser.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Role</p>
                                            <Badge variant={
                                                selectedUser.type === 'ADMIN' ? 'default' :
                                                    selectedUser.type === 'PARTNER' ? 'secondary' : 'outline'
                                            }>
                                                {selectedUser.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Activity</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-gray-500">Member Since</p>
                                            <p className="font-medium">
                                                {new Date(selectedUser.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {/* Add more activity statistics here */}
                                    </div>
                                </div>
                            </div>

                            {/* Related data sections */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Recent Invoices</h3>
                                {/* Add related invoices table */}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Recent Trades</h3>
                                {/* Add related trades table */}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Recent Orders</h3>
                                {/* Add related orders table */}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}