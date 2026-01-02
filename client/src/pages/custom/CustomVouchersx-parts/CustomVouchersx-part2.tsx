  const handleEdit = (voucher: any) => {
    setEditingVoucher(voucher);
    if (activeTab === "receipt") {
      receiptForm.reset({
        voucherDate: (voucher as any).voucherDate,
        amount: (voucher as any).amount,
        currency: (voucher as any).currency,
        subSystemId: (voucher as any).subSystemId,
        sourceType: (voucher as any).sourceType,
        sourceName: (voucher as any).sourceName || "",
        sourceIntermediaryId: (voucher as any).sourceIntermediaryId,
        treasuryId: (voucher as any).treasuryId,
        description: (voucher as any).description || "",
      });
    } else {
      paymentForm.reset({
        voucherDate: (voucher as any).voucherDate,
        amount: (voucher as any).amount,
        currency: (voucher as any).currency,
        subSystemId: (voucher as any).subSystemId,
        treasuryId: (voucher as any).treasuryId,
        destinationType: (voucher as any).destinationType,
        destinationName: (voucher as any).destinationName || "",
        destinationIntermediaryId: (voucher as any).destinationIntermediaryId,
        description: (voucher as any).description || "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السند؟")) {
      if (activeTab === "receipt") {
        deleteReceiptMutation.mutate({ id } as any);
      } else {
        deletePaymentMutation.mutate({ id } as any);
      }
    }
  };

  const handleConfirm = (id: number) => {
    if (activeTab === "receipt") {
      confirmReceiptMutation.mutate({ id } as any);
    } else {
      confirmPaymentMutation.mutate({ id } as any);
    }
  };

  const handleCancel = (id: number) => {
    if (confirm("هل أنت متأكد من إلغاء هذا السند؟")) {
      // See GitHub Issue #3
      toast.info("سيتم تنفيذ الإلغاء قريباً");
    }
  };

  const onSubmitReceipt = (data: ReceiptVoucherFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
      amount: data.amount,
    };

    if (editingVoucher) {
      updateReceiptMutation.mutate({ id: editingVoucher.id, ...payload } as any);
    } else {
      createReceiptMutation.mutate(payload);
    }
  };

  const onSubmitPayment = (data: PaymentVoucherFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
      amount: data.amount,
    };

    if (editingVoucher) {
      updatePaymentMutation.mutate({ id: editingVoucher.id, ...payload } as any);
    } else {
      createPaymentMutation.mutate(payload);
    }
  };

  // Calculate totals
  const receiptTotal = receiptVouchers?.filter((v: any) => v.status === "confirmed")
    .reduce((sum: number, v: any) => sum + parseFloat(v.amount), 0) || 0;
  const paymentTotal = paymentVouchers?.filter((v: any) => v.status === "confirmed")
    .reduce((sum: number, v: any) => sum + parseFloat(v.amount), 0) || 0;

  const isLoading = activeTab === "receipt" ? loadingReceipts : loadingPayments;
  const vouchers = activeTab === "receipt" ? receiptVouchers : paymentVouchers;
  const refetch = activeTab === "receipt" ? refetchReceipts : refetchPayments;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">سندات القبض والصرف</h1>
          <p className="text-slate-400">إدارة جميع السندات المالية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="border-slate-700">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button 
            onClick={() => {
              setEditingVoucher(null);
              if (activeTab === "receipt") {
                receiptForm.reset();
              } else {
                paymentForm.reset();
              }
              setIsDialogOpen(true);
            }}
            className={cn(
              "bg-gradient-to-r",
              activeTab === "receipt" 
                ? "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            )}
          >
            <Plus className="ml-2 h-4 w-4" />
            {activeTab === "receipt" ? "سند قبض جديد" : "سند صرف جديد"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">إجمالي القبض</p>
                <p className="text-2xl font-bold text-green-500">+{receiptTotal.toLocaleString("ar-SA")}</p>
              </div>
              <ArrowDownCircle className="h-10 w-10 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">إجمالي الصرف</p>
                <p className="text-2xl font-bold text-red-500">-{paymentTotal.toLocaleString("ar-SA")}</p>
              </div>
              <ArrowUpCircle className="h-10 w-10 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border",
          receiptTotal - paymentTotal >= 0 
            ? "bg-blue-500/10 border-blue-500/30" 
            : "bg-orange-500/10 border-orange-500/30"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">صافي الحركة</p>
                <p className={cn(
                  "text-2xl font-bold",
                  receiptTotal - paymentTotal >= 0 ? "text-blue-500" : "text-orange-500"
                )}>
                  {(receiptTotal - paymentTotal).toLocaleString("ar-SA")}
                </p>
              </div>
              <FileText className={cn(
                "h-10 w-10",
                receiptTotal - paymentTotal >= 0 ? "text-blue-500/50" : "text-orange-500/50"
              )} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "receipt" | "payment")}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger 
              value="receipt" 
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500"
            >
              <ArrowDownCircle className="ml-2 h-4 w-4" />
              سندات القبض ({receiptVouchers?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500"
            >
              <ArrowUpCircle className="ml-2 h-4 w-4" />
              سندات الصرف ({paymentVouchers?.length || 0})
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-slate-800 border-slate-700"
            />
          </div>
        </div>

        {/* Vouchers Table */}
        <Card className="bg-slate-900/50 border-slate-800 mt-4">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : !vouchers || vouchers.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">لا توجد سندات</p>
                <p className="text-slate-500 text-sm">قم بإضافة سند جديد للبدء</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">رقم السند</TableHead>
                    <TableHead className="text-slate-400">التاريخ</TableHead>
                    <TableHead className="text-slate-400">المبلغ</TableHead>
                    <TableHead className="text-slate-400">{activeTab === "receipt" ? "من" : "إلى"}</TableHead>
                    <TableHead className="text-slate-400">الخزينة</TableHead>
                    <TableHead className="text-slate-400">الحالة</TableHead>
                    <TableHead className="text-slate-400 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(vouchers as any[]).map((voucher: any) => (
                    <VoucherRow
                      key={(voucher as any).id}
                      voucher={voucher}
                      type={activeTab}
                      treasuries={treasuries}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Dialog for Receipt Voucher */}
      <Dialog open={isDialogOpen && activeTab === "receipt"} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setEditingVoucher(null);
          receiptForm.reset();
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-green-500" />
              {editingVoucher ? "تعديل سند القبض" : "سند قبض جديد"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingVoucher ? "قم بتعديل بيانات سند القبض" : "أدخل بيانات سند القبض الجديد"}
            </DialogDescription>
          </DialogHeader>
          <Form {...receiptForm}>
            <form onSubmit={receiptForm.handleSubmit(onSubmitReceipt)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={receiptForm.control as any}
                  name="voucherDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">التاريخ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
