                            const Icon = (config as any).icon;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => field.onChange(key)}
                                className={cn(
                                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                                  field.value === key
                                    ? `${(config as any).borderColor} ${(config as any).bgColor}`
                                    : "border-slate-700 hover:border-slate-600"
                                )}
                              >
                                <Icon className={cn("h-6 w-6", field.value === key ? (config as any).color : "text-slate-400")} />
                                <span className={cn("text-xs", field.value === key ? "text-white" : "text-slate-400")}>
                                  {(config as any).label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    {/* Code */}
                    <FormField
                      control={form.control as any}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الكود</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: CASH-001" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Currency */}
                    <FormField
                      control={form.control as any}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">العملة</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-800 border-slate-700">
                                <SelectValue placeholder="اختر العملة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-slate-800">
                              <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                              <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                              <SelectItem value="EUR">يورو (EUR)</SelectItem>
                              <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Name Arabic */}
                    <FormField
                      control={form.control as any}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الاسم بالعربي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: الصندوق الرئيسي" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Name English */}
                    <FormField
                      control={form.control as any}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الاسم بالإنجليزي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Example: Main Cash" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Sub System */}
                  <FormField
                    control={form.control as any}
                    name="subSystemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">النظام الفرعي (اختياري)</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue placeholder="اختر النظام الفرعي" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            <SelectItem value="0">بدون نظام فرعي</SelectItem>
                            {subSystems?.map((sys: any) => (
                              <SelectItem key={sys.id} value={sys.id.toString()}>
                                {sys.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Fields */}
                  {watchTreasuryType === "bank" && (
                    <>
                      <FormField
                        control={form.control as any}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">اسم البنك</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="مثال: البنك الأهلي" className="bg-slate-800 border-slate-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control as any}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">رقم الحساب</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="رقم الحساب" className="bg-slate-800 border-slate-700" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name="iban"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">IBAN</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="SA..." className="bg-slate-800 border-slate-700" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {/* Wallet Fields */}
                  {watchTreasuryType === "wallet" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="walletProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">مزود المحفظة</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="اختر المزود" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                {walletProviders.map((provider) => (
                                  <SelectItem key={provider.value} value={provider.value}>
                                    {provider.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="walletNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">رقم المحفظة</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="05xxxxxxxx" className="bg-slate-800 border-slate-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Opening Balance */}
                  <FormField
                    control={form.control as any}
                    name="openingBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">الرصيد الافتتاحي</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" className="bg-slate-800 border-slate-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control as any}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">الوصف</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="وصف الخزينة..." className="bg-slate-800 border-slate-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                      إلغاء
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      {editingTreasury ? "تحديث" : "إضافة"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">إجمالي الأرصدة</p>
                <p className="text-2xl font-bold text-white">{totals.total.toLocaleString("ar-SA")}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(treasuryTypes).map(([key, config]) => {
          const Icon = (config as any).icon;
          return (
            <Card key={key} className={cn("bg-slate-900/50 border", (config as any).borderColor)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{(config as any).label}</p>
                    <p className={cn("text-xl font-bold", (config as any).color)}>
                      {(totals[key] || 0).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", (config as any).bgColor)}>
                    <Icon className={cn("h-5 w-5", (config as any).color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">الكل</TabsTrigger>
            <TabsTrigger value="cash" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
              صناديق
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500">
              بنوك
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500">
              محافظ
            </TabsTrigger>
            <TabsTrigger value="exchange" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">
              صرافين
            </TabsTrigger>
          </TabsList>
        </Tabs>
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

      {/* Treasury Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredTreasuries.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">لا توجد خزائن</p>
            <p className="text-slate-500 text-sm">قم بإضافة خزينة جديدة للبدء</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filteredTreasuries as any[]).map((treasury: any) => (
            <TreasuryCard
              key={(treasury as any).id}
              treasury={treasury}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
