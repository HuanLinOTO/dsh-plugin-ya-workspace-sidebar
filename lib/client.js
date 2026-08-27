window.__ModuleLoader__.load({
	id: "@huanlin/dsh-plugin-ya-workspace-sidebar",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/dictionaries.ts
		const dicts = {
			ja: {
				workspaces: "ワークスペース",
				sessions: "セッション",
				recent: "最近のセッション",
				ungrouped: "未分類",
				newSession: "新しいセッション",
				addWorkspace: "ワークスペースを追加",
				addWorkspaceMenu: "ワークスペースを追加…",
				search: "セッションを検索",
				searchPlaceholder: "名前、キーワードで検索…",
				clearSearch: "検索をクリア",
				searching: "セッション履歴を検索中…",
				searchUnavailable: "内容検索は利用できません。名前の一致のみ表示します。",
				noMatches: "一致するセッションなし",
				noSessions: "セッションはまだありません",
				noWorkspaces: "ワークスペースはまだありません",
				loading: "ワークスペースを読み込み中…",
				rename: "名前を変更",
				renameWorkspace: "ワークスペースの名前を変更",
				renameSession: "セッションの名前を変更",
				deleteWorkspace: "ワークスペースを削除",
				deleteDescription: "「{name}」をワークスペース一覧から削除します。フォルダとセッション履歴は残ります。",
				fork: "セッションをフォーク",
				archive: "セッションをアーカイブ",
				archiveMode: "アーカイブモード",
				deleteMode: "削除モード",
				deleteSession: "セッションを削除",
				deleteSessionTitle: "セッションを削除",
				deleteSessionConfirm: "このセッションを削除しますか？一覧から削除され、元に戻せません。",
				toggleActionMode: "アーカイブ/削除モードを切り替え",
				actionModeLabel: "セッション操作",
				cancel: "キャンセル",
				confirm: "確認",
				retry: "選び直す",
				folderError: "フォルダを開けませんでした",
				workspaceName: "ワークスペース名",
				sessionName: "セッション名",
				count: "{n} 件のセッション",
				now: "たった今",
				minutes: "{n}分",
				hours: "{n}時間",
				days: "{n}日",
				months: "{n}か月",
				years: "{n}年",
				running: "実行中",
				waiting: "操作待ち",
				completed: "完了",
				collapse: "折りたたむ",
				expand: "展開",
				today: "今日",
				yesterday: "昨日",
				date: "{m}月{d}日",
				dateYear: "{y}年{m}月{d}日"
			},
			de: {
				workspaces: "Arbeitsbereiche",
				sessions: "Sitzungen",
				recent: "Letzte Sitzungen",
				ungrouped: "Nicht gruppiert",
				newSession: "Neue Sitzung",
				addWorkspace: "Arbeitsbereich hinzufügen",
				addWorkspaceMenu: "Arbeitsbereich hinzufügen…",
				search: "Sitzungen durchsuchen",
				searchPlaceholder: "Name, Stichwörter suchen…",
				clearSearch: "Suche löschen",
				searching: "Sitzungsverlauf wird durchsucht…",
				searchUnavailable: "Inhaltssuche nicht verfügbar. Zeigt Namensübereinstimmungen.",
				noMatches: "Keine passenden Sitzungen",
				noSessions: "Noch keine Sitzungen",
				noWorkspaces: "Noch keine Arbeitsbereiche",
				loading: "Arbeitsbereiche werden geladen…",
				rename: "Umbenennen",
				renameWorkspace: "Arbeitsbereich umbenennen",
				renameSession: "Sitzung umbenennen",
				deleteWorkspace: "Arbeitsbereich löschen",
				deleteDescription: "„{name}\" wird aus der Arbeitsbereichsliste entfernt. Ordner und Sitzungsverläufe bleiben erhalten.",
				fork: "Sitzung forken",
				archive: "Sitzung archivieren",
				archiveMode: "Archivmodus",
				deleteMode: "Löschmodus",
				deleteSession: "Sitzung löschen",
				deleteSessionTitle: "Sitzung löschen",
				deleteSessionConfirm: "Diese Sitzung wirklich löschen? Sie wird aus der Liste entfernt. Dies kann nicht rückgängig gemacht werden.",
				toggleActionMode: "Archiv-/Löschmodus umschalten",
				actionModeLabel: "Sitzungsaktion",
				cancel: "Abbrechen",
				confirm: "Bestätigen",
				retry: "Neu wählen",
				folderError: "Ordner konnte nicht geöffnet werden",
				workspaceName: "Arbeitsbereichsname",
				sessionName: "Sitzungsname",
				count: "{n} Sitzungen",
				now: "gerade eben",
				minutes: "{n} Min",
				hours: "{n} h",
				days: "{n} Tage",
				months: "{n} Mon",
				years: "{n} J",
				running: "Läuft",
				waiting: "Wartet auf Eingabe",
				completed: "Abgeschlossen",
				collapse: "Einklappen",
				expand: "Ausklappen",
				today: "Heute",
				yesterday: "Gestern",
				date: "{d}.{m}.",
				dateYear: "{d}.{m}.{y}"
			},
			fr: {
				workspaces: "Espaces de travail",
				sessions: "Sessions",
				recent: "Sessions récentes",
				ungrouped: "Non groupé",
				newSession: "Nouvelle session",
				addWorkspace: "Ajouter un espace de travail",
				addWorkspaceMenu: "Ajouter un espace de travail…",
				search: "Rechercher des sessions",
				searchPlaceholder: "Rechercher un nom, des mots-clés…",
				clearSearch: "Effacer la recherche",
				searching: "Recherche dans l’historique des sessions…",
				searchUnavailable: "La recherche de contenu est indisponible. Affichage des correspondances de nom.",
				noMatches: "Aucune session correspondante",
				noSessions: "Aucune session pour l’instant",
				noWorkspaces: "Aucun espace de travail pour l’instant",
				loading: "Chargement des espaces de travail…",
				rename: "Renommer",
				renameWorkspace: "Renommer l’espace de travail",
				renameSession: "Renommer la session",
				deleteWorkspace: "Supprimer l’espace de travail",
				deleteDescription: "« {name} » sera retiré de la liste des espaces de travail. Le dossier et l’historique des sessions sont conservés.",
				fork: "Dupliquer la session",
				archive: "Archiver la session",
				archiveMode: "Mode archivage",
				deleteMode: "Mode suppression",
				deleteSession: "Supprimer la session",
				deleteSessionTitle: "Supprimer la session",
				deleteSessionConfirm: "Voulez-vous vraiment supprimer cette session ? Elle sera retirée de la liste. Cette action est irréversible.",
				toggleActionMode: "Basculer entre archivage/suppression",
				actionModeLabel: "Action de session",
				cancel: "Annuler",
				confirm: "Confirmer",
				retry: "Resélectionner",
				folderError: "Impossible d’ouvrir le dossier",
				workspaceName: "Nom de l’espace de travail",
				sessionName: "Nom de la session",
				count: "{n} sessions",
				now: "à l’instant",
				minutes: "{n} min",
				hours: "{n} h",
				days: "{n} j",
				months: "{n} mois",
				years: "{n} ans",
				running: "En cours",
				waiting: "En attente d’une action",
				completed: "Terminé",
				collapse: "Réduire",
				expand: "Développer",
				today: "Aujourd’hui",
				yesterday: "Hier",
				date: "{d}/{m}",
				dateYear: "{d}/{m}/{y}"
			},
			pt: {
				workspaces: "Espaços de trabalho",
				sessions: "Sessões",
				recent: "Sessões recentes",
				ungrouped: "Não agrupado",
				newSession: "Nova sessão",
				addWorkspace: "Adicionar espaço de trabalho",
				addWorkspaceMenu: "Adicionar espaço de trabalho…",
				search: "Pesquisar sessões",
				searchPlaceholder: "Pesquisar nome, palavras-chave…",
				clearSearch: "Limpar pesquisa",
				searching: "Pesquisando histórico de sessões…",
				searchUnavailable: "A pesquisa de conteúdo está indisponível. Exibindo correspondências de nome.",
				noMatches: "Nenhuma sessão correspondente",
				noSessions: "Nenhuma sessão ainda",
				noWorkspaces: "Nenhum espaço de trabalho ainda",
				loading: "Carregando espaços de trabalho…",
				rename: "Renomear",
				renameWorkspace: "Renomear espaço de trabalho",
				renameSession: "Renomear sessão",
				deleteWorkspace: "Excluir espaço de trabalho",
				deleteDescription: "Isto remove “{name}” da lista de espaços de trabalho. A pasta e os registros de sessão são mantidos.",
				fork: "Bifurcar sessão",
				archive: "Arquivar sessão",
				archiveMode: "Modo de arquivamento",
				deleteMode: "Modo de exclusão",
				deleteSession: "Excluir sessão",
				deleteSessionTitle: "Excluir sessão",
				deleteSessionConfirm: "Tem certeza de que deseja excluir esta sessão? Ela será removida da lista. Esta ação não pode ser desfeita.",
				toggleActionMode: "Alternar modo arquivar/excluir",
				actionModeLabel: "Ação de sessão",
				cancel: "Cancelar",
				confirm: "Confirmar",
				retry: "Escolher novamente",
				folderError: "Não foi possível abrir a pasta",
				workspaceName: "Nome do espaço de trabalho",
				sessionName: "Nome da sessão",
				count: "{n} sessões",
				now: "agora",
				minutes: "{n} min",
				hours: "{n} h",
				days: "{n} d",
				months: "{n} meses",
				years: "{n} anos",
				running: "Em andamento",
				waiting: "Aguardando interação",
				completed: "Concluído",
				collapse: "Recolher",
				expand: "Expandir",
				today: "Hoje",
				yesterday: "Ontem",
				date: "{d}/{m}",
				dateYear: "{d}/{m}/{y}"
			},
			ko: {
				workspaces: "작업 공간",
				sessions: "세션",
				recent: "최근 세션",
				ungrouped: "그룹 없음",
				newSession: "새 세션",
				addWorkspace: "작업 공간 추가",
				addWorkspaceMenu: "작업 공간 추가…",
				search: "세션 검색",
				searchPlaceholder: "이름, 키워드 검색…",
				clearSearch: "검색 지우기",
				searching: "세션 기록 검색 중…",
				searchUnavailable: "내용 검색을 사용할 수 없습니다. 이름 일치만 표시합니다.",
				noMatches: "일치하는 세션 없음",
				noSessions: "아직 세션이 없습니다",
				noWorkspaces: "아직 작업 공간이 없습니다",
				loading: "작업 공간 불러오는 중…",
				rename: "이름 바꾸기",
				renameWorkspace: "작업 공간 이름 바꾸기",
				renameSession: "세션 이름 바꾸기",
				deleteWorkspace: "작업 공간 삭제",
				deleteDescription: "“{name}”을(를) 작업 공간 목록에서 제거합니다. 폴더와 세션 기록은 유지됩니다.",
				fork: "세션 포크",
				archive: "세션 보관",
				archiveMode: "보관 모드",
				deleteMode: "삭제 모드",
				deleteSession: "세션 삭제",
				deleteSessionTitle: "세션 삭제",
				deleteSessionConfirm: "이 세션을 삭제하시겠습니까? 목록에서 제거되며 되돌릴 수 없습니다.",
				toggleActionMode: "보관/삭제 모드 전환",
				actionModeLabel: "세션 작업",
				cancel: "취소",
				confirm: "확인",
				retry: "다시 선택",
				folderError: "폴더를 열 수 없음",
				workspaceName: "작업 공간 이름",
				sessionName: "세션 이름",
				count: "세션 {n}개",
				now: "방금",
				minutes: "{n}분",
				hours: "{n}시간",
				days: "{n}일",
				months: "{n}개월",
				years: "{n}년",
				running: "진행 중",
				waiting: "상호작용 대기 중",
				completed: "완료됨",
				collapse: "접기",
				expand: "펼치기",
				today: "오늘",
				yesterday: "어제",
				date: "{m}월 {d}일",
				dateYear: "{y}년 {m}월 {d}일"
			},
			ar: {
				workspaces: "مساحات العمل",
				sessions: "الجلسات",
				recent: "الجلسات الأخيرة",
				ungrouped: "غير مجمّع",
				newSession: "جلسة جديدة",
				addWorkspace: "إضافة مساحة عمل",
				addWorkspaceMenu: "إضافة مساحة عمل…",
				search: "البحث في الجلسات",
				searchPlaceholder: "ابحث بالاسم أو الكلمات المفتاحية…",
				clearSearch: "مسح البحث",
				searching: "جارٍ البحث في سجل الجلسات…",
				searchUnavailable: "البحث في المحتوى غير متاح. عرض تطابقات الأسماء فقط.",
				noMatches: "لا توجد جلسات مطابقة",
				noSessions: "لا توجد جلسات بعد",
				noWorkspaces: "لا توجد مساحات عمل بعد",
				loading: "جارٍ تحميل مساحات العمل…",
				rename: "إعادة تسمية",
				renameWorkspace: "إعادة تسمية مساحة العمل",
				renameSession: "إعادة تسمية الجلسة",
				deleteWorkspace: "حذف مساحة العمل",
				deleteDescription: "سيؤدي هذا إلى إزالة \"{name}\" من قائمة مساحات العمل. سيبقى المجلد وسجلات الجلسة محفوظين.",
				fork: "إنشاء نسخة من الجلسة",
				archive: "أرشفة الجلسة",
				archiveMode: "وضع الأرشفة",
				deleteMode: "وضع الحذف",
				deleteSession: "حذف الجلسة",
				deleteSessionTitle: "حذف الجلسة",
				deleteSessionConfirm: "هل أنت متأكد من حذف هذه الجلسة؟ ستُزال من القائمة ولا يمكن التراجع عن هذا الإجراء.",
				toggleActionMode: "تبديل وضع الأرشفة/الحذف",
				actionModeLabel: "إجراء الجلسة",
				cancel: "إلغاء",
				confirm: "تأكيد",
				retry: "إعادة الاختيار",
				folderError: "تعذّر فتح المجلد",
				workspaceName: "اسم مساحة العمل",
				sessionName: "اسم الجلسة",
				count: "{n} جلسات",
				now: "الآن",
				minutes: "{n} دقيقة",
				hours: "{n} ساعة",
				days: "{n} يوم",
				months: "{n} شهر",
				years: "{n} سنة",
				running: "قيد التنفيذ",
				waiting: "بانتظار التفاعل",
				completed: "مكتمل",
				collapse: "طي",
				expand: "توسيع",
				today: "اليوم",
				yesterday: "أمس",
				date: "{m}/{d}",
				dateYear: "{m}/{d}/{y}"
			},
			hi: {
				workspaces: "कार्यक्षेत्र",
				sessions: "सत्र",
				recent: "हाल के सत्र",
				ungrouped: "असमूहीकृत",
				newSession: "नया सत्र",
				addWorkspace: "कार्यक्षेत्र जोड़ें",
				addWorkspaceMenu: "कार्यक्षेत्र जोड़ें…",
				search: "सत्र खोजें",
				searchPlaceholder: "नाम, कीवर्ड खोजें…",
				clearSearch: "खोज साफ़ करें",
				searching: "सत्र इतिहास खोजा जा रहा है…",
				searchUnavailable: "सामग्री खोज उपलब्ध नहीं है। केवल नाम मिलान दिखाए जा रहे हैं।",
				noMatches: "कोई मिलान सत्र नहीं",
				noSessions: "अभी कोई सत्र नहीं",
				noWorkspaces: "अभी कोई कार्यक्षेत्र नहीं",
				loading: "कार्यक्षेत्र लोड हो रहे हैं…",
				rename: "नाम बदलें",
				renameWorkspace: "कार्यक्षेत्र का नाम बदलें",
				renameSession: "सत्र का नाम बदलें",
				deleteWorkspace: "कार्यक्षेत्र हटाएँ",
				deleteDescription: "यह \"{name}\" को कार्यक्षेत्र सूची से हटा देगा। फ़ोल्डर और सत्र रिकॉर्ड रहेंगे।",
				fork: "सत्र फ़ोर्क करें",
				archive: "सत्र संग्रह करें",
				archiveMode: "संग्रह मोड",
				deleteMode: "हटाने का मोड",
				deleteSession: "सत्र हटाएँ",
				deleteSessionTitle: "सत्र हटाएँ",
				deleteSessionConfirm: "क्या आप वाकई इस सत्र को हटाना चाहते हैं? यह सूची से हट जाएगा। इसे पूर्ववत नहीं किया जा सकता।",
				toggleActionMode: "संग्रह/हटाएँ मोड टॉगल करें",
				actionModeLabel: "सत्र क्रिया",
				cancel: "रद्द करें",
				confirm: "पुष्टि करें",
				retry: "फिर से चुनें",
				folderError: "फ़ोल्डर नहीं खोला जा सका",
				workspaceName: "कार्यक्षेत्र का नाम",
				sessionName: "सत्र का नाम",
				count: "{n} सत्र",
				now: "अभी",
				minutes: "{n} मिनट",
				hours: "{n} घंटे",
				days: "{n} दिन",
				months: "{n} महीने",
				years: "{n} वर्ष",
				running: "चल रहा है",
				waiting: "इंटरैक्शन की प्रतीक्षा में",
				completed: "पूर्ण",
				collapse: "संक्षिप्त करें",
				expand: "विस्तार करें",
				today: "आज",
				yesterday: "कल",
				date: "{d}/{m}",
				dateYear: "{d}/{m}/{y}"
			},
			id: {
				workspaces: "Ruang kerja",
				sessions: "Sesi",
				recent: "Sesi terbaru",
				ungrouped: "Tidak dikelompokkan",
				newSession: "Sesi baru",
				addWorkspace: "Tambah ruang kerja",
				addWorkspaceMenu: "Tambah ruang kerja…",
				search: "Cari sesi",
				searchPlaceholder: "Cari nama, kata kunci…",
				clearSearch: "Bersihkan pencarian",
				searching: "Mencari riwayat sesi…",
				searchUnavailable: "Pencarian konten tidak tersedia. Hanya mencocokkan nama.",
				noMatches: "Tidak ada sesi yang cocok",
				noSessions: "Belum ada sesi",
				noWorkspaces: "Belum ada ruang kerja",
				loading: "Memuat ruang kerja…",
				rename: "Ganti nama",
				renameWorkspace: "Ganti nama ruang kerja",
				renameSession: "Ganti nama sesi",
				deleteWorkspace: "Hapus ruang kerja",
				deleteDescription: "Ini menghapus “{name}” dari daftar ruang kerja. Folder dan riwayat sesi tetap tersimpan.",
				fork: "Fork sesi",
				archive: "Arsipkan sesi",
				archiveMode: "Mode arsip",
				deleteMode: "Mode hapus",
				deleteSession: "Hapus sesi",
				deleteSessionTitle: "Hapus sesi",
				deleteSessionConfirm: "Yakin ingin menghapus sesi ini? Sesi akan dihapus dari daftar. Tindakan ini tidak dapat dibatalkan.",
				toggleActionMode: "Ganti mode arsip/hapus",
				actionModeLabel: "Tindakan sesi",
				cancel: "Batal",
				confirm: "Konfirmasi",
				retry: "Pilih lagi",
				folderError: "Gagal membuka folder",
				workspaceName: "Nama ruang kerja",
				sessionName: "Nama sesi",
				count: "{n} sesi",
				now: "baru saja",
				minutes: "{n} mnt",
				hours: "{n} jam",
				days: "{n} hari",
				months: "{n} bln",
				years: "{n} thn",
				running: "Berjalan",
				waiting: "Menunggu interaksi",
				completed: "Selesai",
				collapse: "Ciutkan",
				expand: "Bentangkan",
				today: "Hari ini",
				yesterday: "Kemarin",
				date: "{d}/{m}",
				dateYear: "{d}/{m}/{y}"
			},
			tr: {
				workspaces: "Çalışma alanları",
				sessions: "Oturumlar",
				recent: "Son oturumlar",
				ungrouped: "Gruplanmamış",
				newSession: "Yeni oturum",
				addWorkspace: "Çalışma alanı ekle",
				addWorkspaceMenu: "Çalışma alanı ekle…",
				search: "Oturumları ara",
				searchPlaceholder: "İsim, anahtar kelime ara…",
				clearSearch: "Aramayı temizle",
				searching: "Oturum geçmişi aranıyor…",
				searchUnavailable: "İçerik araması kullanılamıyor. Yalnızca isim eşleşmeleri gösteriliyor.",
				noMatches: "Eşleşen oturum yok",
				noSessions: "Henüz oturum yok",
				noWorkspaces: "Henüz çalışma alanı yok",
				loading: "Çalışma alanları yükleniyor…",
				rename: "Yeniden adlandır",
				renameWorkspace: "Çalışma alanını yeniden adlandır",
				renameSession: "Oturumu yeniden adlandır",
				deleteWorkspace: "Çalışma alanını sil",
				deleteDescription: "Bu, “{name}” öğesini çalışma alanı listesinden kaldırır. Klasör ve oturum kayıtları kalır.",
				fork: "Oturumu çatalla",
				archive: "Oturumu arşivle",
				archiveMode: "Arşiv modu",
				deleteMode: "Silme modu",
				deleteSession: "Oturumu sil",
				deleteSessionTitle: "Oturumu sil",
				deleteSessionConfirm: "Bu oturumu silmek istediğinize emin misiniz? Listeden kaldırılacaktır. Bu işlem geri alınamaz.",
				toggleActionMode: "Arşiv/silme modunu değiştir",
				actionModeLabel: "Oturum işlemi",
				cancel: "İptal",
				confirm: "Onayla",
				retry: "Yeniden seç",
				folderError: "Klasör açılamadı",
				workspaceName: "Çalışma alanı adı",
				sessionName: "Oturum adı",
				count: "{n} oturum",
				now: "az önce",
				minutes: "{n} dk",
				hours: "{n} sa",
				days: "{n} gün",
				months: "{n} ay",
				years: "{n} yıl",
				running: "Devam ediyor",
				waiting: "Etkileşim bekleniyor",
				completed: "Tamamlandı",
				collapse: "Daralt",
				expand: "Genişlet",
				today: "Bugün",
				yesterday: "Dün",
				date: "{d}.{m}",
				dateYear: "{d}.{m}.{y}"
			},
			vi: {
				workspaces: "Không gian làm việc",
				sessions: "Phiên",
				recent: "Phiên gần đây",
				ungrouped: "Chưa nhóm",
				newSession: "Phiên mới",
				addWorkspace: "Thêm không gian làm việc",
				addWorkspaceMenu: "Thêm không gian làm việc…",
				search: "Tìm kiếm phiên",
				searchPlaceholder: "Tìm tên, từ khóa…",
				clearSearch: "Xóa tìm kiếm",
				searching: "Đang tìm kiếm lịch sử phiên…",
				searchUnavailable: "Tìm kiếm nội dung không khả dụng. Chỉ hiển thị kết quả khớp tên.",
				noMatches: "Không có phiên phù hợp",
				noSessions: "Chưa có phiên nào",
				noWorkspaces: "Chưa có không gian làm việc nào",
				loading: "Đang tải không gian làm việc…",
				rename: "Đổi tên",
				renameWorkspace: "Đổi tên không gian làm việc",
				renameSession: "Đổi tên phiên",
				deleteWorkspace: "Xóa không gian làm việc",
				deleteDescription: "Thao tác này sẽ xóa “{name}” khỏi danh sách không gian làm việc. Thư mục và nhật ký phiên vẫn được giữ.",
				fork: "Nhân bản phiên",
				archive: "Lưu trữ phiên",
				archiveMode: "Chế độ lưu trữ",
				deleteMode: "Chế độ xóa",
				deleteSession: "Xóa phiên",
				deleteSessionTitle: "Xóa phiên",
				deleteSessionConfirm: "Bạn có chắc muốn xóa phiên này? Phiên sẽ bị xóa khỏi danh sách. Hành động này không thể hoàn tác.",
				toggleActionMode: "Chuyển chế độ lưu trữ/xóa",
				actionModeLabel: "Thao tác phiên",
				cancel: "Hủy",
				confirm: "Xác nhận",
				retry: "Chọn lại",
				folderError: "Không thể mở thư mục",
				workspaceName: "Tên không gian làm việc",
				sessionName: "Tên phiên",
				count: "{n} phiên",
				now: "vừa xong",
				minutes: "{n} phút",
				hours: "{n} giờ",
				days: "{n} ngày",
				months: "{n} tháng",
				years: "{n} năm",
				running: "Đang chạy",
				waiting: "Đang chờ tương tác",
				completed: "Hoàn tất",
				collapse: "Thu gọn",
				expand: "Mở rộng",
				today: "Hôm nay",
				yesterday: "Hôm qua",
				date: "{d}/{m}",
				dateYear: "{d}/{m}/{y}"
			},
			th: {
				workspaces: "พื้นที่ทำงาน",
				sessions: "เซสชัน",
				recent: "เซสชันล่าสุด",
				ungrouped: "ไม่จัดกลุ่ม",
				newSession: "เซสชันใหม่",
				addWorkspace: "เพิ่มพื้นที่ทำงาน",
				addWorkspaceMenu: "เพิ่มพื้นที่ทำงาน…",
				search: "ค้นหาเซสชัน",
				searchPlaceholder: "ค้นหาชื่อ คำสำคัญ…",
				clearSearch: "ล้างการค้นหา",
				searching: "กำลังค้นหาประวัติเซสชัน…",
				searchUnavailable: "การค้นหาเนื้อหาไม่พร้อมใช้งาน แสดงเฉพาะชื่อที่ตรงกัน",
				noMatches: "ไม่พบเซสชันที่ตรงกัน",
				noSessions: "ยังไม่มีเซสชัน",
				noWorkspaces: "ยังไม่มีพื้นที่ทำงาน",
				loading: "กำลังโหลดพื้นที่ทำงาน…",
				rename: "เปลี่ยนชื่อ",
				renameWorkspace: "เปลี่ยนชื่อพื้นที่ทำงาน",
				renameSession: "เปลี่ยนชื่อเซสชัน",
				deleteWorkspace: "ลบพื้นที่ทำงาน",
				deleteDescription: "การดำเนินการนี้จะนำ “{name}” ออกจากรายการพื้นที่ทำงาน โฟลเดอร์และบันทึกเซสชันจะยังคงอยู่",
				fork: "แยกสาขาเซสชัน",
				archive: "เก็บถาวรเซสชัน",
				archiveMode: "โหมดเก็บถาวร",
				deleteMode: "โหมดลบ",
				deleteSession: "ลบเซสชัน",
				deleteSessionTitle: "ลบเซสชัน",
				deleteSessionConfirm: "คุณแน่ใจหรือไม่ว่าต้องการลบเซสชันนี้ จะถูกลบออกจากรายการและไม่สามารถย้อนกลับได้",
				toggleActionMode: "สลับโหมดเก็บถาวร/ลบ",
				actionModeLabel: "การจัดการเซสชัน",
				cancel: "ยกเลิก",
				confirm: "ยืนยัน",
				retry: "เลือกใหม่",
				folderError: "ไม่สามารถเปิดโฟลเดอร์ได้",
				workspaceName: "ชื่อพื้นที่ทำงาน",
				sessionName: "ชื่อเซสชัน",
				count: "{n} เซสชัน",
				now: "เมื่อสักครู่",
				minutes: "{n} นาที",
				hours: "{n} ชั่วโมง",
				days: "{n} วัน",
				months: "{n} เดือน",
				years: "{n} ปี",
				running: "กำลังดำเนินการ",
				waiting: "รอปฏิสัมพันธ์",
				completed: "เสร็จสิ้น",
				collapse: "ย่อ",
				expand: "ขยาย",
				today: "วันนี้",
				yesterday: "เมื่อวาน",
				date: "{d}/{m}",
				dateYear: "{d}/{m}/{y}"
			},
			ru: {
				workspaces: "Рабочие области",
				sessions: "Сеансы",
				recent: "Недавние сеансы",
				ungrouped: "Без группы",
				newSession: "Новый сеанс",
				addWorkspace: "Добавить рабочую область",
				addWorkspaceMenu: "Добавить рабочую область…",
				search: "Поиск сеансов",
				searchPlaceholder: "Искать по имени, ключевым словам…",
				clearSearch: "Очистить поиск",
				searching: "Поиск по истории сеансов…",
				searchUnavailable: "Поиск по содержимому недоступен. Показываем совпадения по имени.",
				noMatches: "Нет подходящих сеансов",
				noSessions: "Пока нет сеансов",
				noWorkspaces: "Пока нет рабочих областей",
				loading: "Загрузка рабочих областей…",
				rename: "Переименовать",
				renameWorkspace: "Переименовать рабочую область",
				renameSession: "Переименовать сеанс",
				deleteWorkspace: "Удалить рабочую область",
				deleteDescription: "«{name}» будет удалён из списка рабочих областей. Папка и записи сеансов сохранятся.",
				fork: "Ответвить сеанс",
				archive: "Архивировать сеанс",
				archiveMode: "Режим архивации",
				deleteMode: "Режим удаления",
				deleteSession: "Удалить сеанс",
				deleteSessionTitle: "Удалить сеанс",
				deleteSessionConfirm: "Удалить этот сеанс? Он будет убран из списка. Действие необратимо.",
				toggleActionMode: "Переключить режим архивации/удаления",
				actionModeLabel: "Действие с сеансом",
				cancel: "Отмена",
				confirm: "Подтвердить",
				retry: "Выбрать заново",
				folderError: "Не удалось открыть папку",
				workspaceName: "Название рабочей области",
				sessionName: "Название сеанса",
				count: "{n} сеансов",
				now: "только что",
				minutes: "{n} мин",
				hours: "{n} ч",
				days: "{n} дн",
				months: "{n} мес",
				years: "{n} г",
				running: "Выполняется",
				waiting: "Ожидает действий",
				completed: "Завершён",
				collapse: "Свернуть",
				expand: "Развернуть",
				today: "Сегодня",
				yesterday: "Вчера",
				date: "{d}.{m}",
				dateYear: "{d}.{m}.{y}"
			},
			it: {
				workspaces: "Aree di lavoro",
				sessions: "Sessioni",
				recent: "Sessioni recenti",
				ungrouped: "Non raggruppati",
				newSession: "Nuova sessione",
				addWorkspace: "Aggiungi area di lavoro",
				addWorkspaceMenu: "Aggiungi area di lavoro…",
				search: "Cerca sessioni",
				searchPlaceholder: "Cerca nome, parole chiave…",
				clearSearch: "Cancella ricerca",
				searching: "Ricerca nella cronologia delle sessioni…",
				searchUnavailable: "La ricerca dei contenuti non è disponibile. Visualizzati solo i nomi corrispondenti.",
				noMatches: "Nessuna sessione corrispondente",
				noSessions: "Nessuna sessione per ora",
				noWorkspaces: "Nessuna area di lavoro per ora",
				loading: "Caricamento aree di lavoro…",
				rename: "Rinomina",
				renameWorkspace: "Rinomina area di lavoro",
				renameSession: "Rinomina sessione",
				deleteWorkspace: "Elimina area di lavoro",
				deleteDescription: "Questo rimuove “{name}” dall’elenco delle aree di lavoro. La cartella e i log delle sessioni restano.",
				fork: "Duplica sessione",
				archive: "Archivia sessione",
				archiveMode: "Modalità archivio",
				deleteMode: "Modalità eliminazione",
				deleteSession: "Elimina sessione",
				deleteSessionTitle: "Elimina sessione",
				deleteSessionConfirm: "Vuoi davvero eliminare questa sessione? Verrà rimossa dall’elenco. L’operazione non può essere annullata.",
				toggleActionMode: "Commuta modalità archiviazione/eliminazione",
				actionModeLabel: "Azione sessione",
				cancel: "Annulla",
				confirm: "Conferma",
				retry: "Scegli di nuovo",
				folderError: "Impossibile aprire la cartella",
				workspaceName: "Nome area di lavoro",
				sessionName: "Nome sessione",
				count: "{n} sessioni",
				now: "adesso",
				minutes: "{n} min",
				hours: "{n} h",
				days: "{n} g",
				months: "{n} mesi",
				years: "{n} anni",
				running: "In corso",
				waiting: "In attesa di interazione",
				completed: "Completata",
				collapse: "Comprimi",
				expand: "Espandi",
				today: "Oggi",
				yesterday: "Ieri",
				date: "{d}/{m}",
				dateYear: "{d}/{m}/{y}"
			},
			nl: {
				workspaces: "Werkruimten",
				sessions: "Sessies",
				recent: "Recente sessies",
				ungrouped: "Niet gegroepeerd",
				newSession: "Nieuwe sessie",
				addWorkspace: "Werkruimte toevoegen",
				addWorkspaceMenu: "Werkruimte toevoegen…",
				search: "Sessies zoeken",
				searchPlaceholder: "Zoeken op naam, trefwoorden…",
				clearSearch: "Zoekopdracht wissen",
				searching: "Sessiegeschiedenis doorzoeken…",
				searchUnavailable: "Inhoud zoeken is niet beschikbaar. Er worden alleen naamovereenkomsten getoond.",
				noMatches: "Geen overeenkomende sessies",
				noSessions: "Nog geen sessies",
				noWorkspaces: "Nog geen werkruimten",
				loading: "Werkruimten laden…",
				rename: "Hernoemen",
				renameWorkspace: "Werkruimte hernoemen",
				renameSession: "Sessie hernoemen",
				deleteWorkspace: "Werkruimte verwijderen",
				deleteDescription: "Hiermee wordt “{name}” uit de werkruimtelijst verwijderd. De map en sessielogboeken blijven behouden.",
				fork: "Sessie forken",
				archive: "Sessie archiveren",
				archiveMode: "Archiefmodus",
				deleteMode: "Verwijdermodus",
				deleteSession: "Sessie verwijderen",
				deleteSessionTitle: "Sessie verwijderen",
				deleteSessionConfirm: "Weet je zeker dat je deze sessie wilt verwijderen? Deze wordt uit de lijst verwijderd. Dit kan niet ongedaan worden gemaakt.",
				toggleActionMode: "Archief-/verwijdermodus wisselen",
				actionModeLabel: "Sessieactie",
				cancel: "Annuleren",
				confirm: "Bevestigen",
				retry: "Opnieuw kiezen",
				folderError: "Map kon niet worden geopend",
				workspaceName: "Naam werkruimte",
				sessionName: "Naam sessie",
				count: "{n} sessies",
				now: "zojuist",
				minutes: "{n} min",
				hours: "{n} u",
				days: "{n} d",
				months: "{n} mnd",
				years: "{n} jr",
				running: "Bezig",
				waiting: "Wacht op interactie",
				completed: "Voltooid",
				collapse: "Inklappen",
				expand: "Uitklappen",
				today: "Vandaag",
				yesterday: "Gisteren",
				date: "{d}-{m}",
				dateYear: "{d}-{m}-{y}"
			},
			sv: {
				workspaces: "Arbetsytor",
				sessions: "Sessioner",
				recent: "Senaste sessionerna",
				ungrouped: "Ogrupperat",
				newSession: "Ny session",
				addWorkspace: "Lägg till arbetsyta",
				addWorkspaceMenu: "Lägg till arbetsyta…",
				search: "Sök sessioner",
				searchPlaceholder: "Sök namn, nyckelord…",
				clearSearch: "Rensa sökning",
				searching: "Söker sessionshistorik…",
				searchUnavailable: "Innehållssökning är inte tillgänglig. Visar endast namnträffar.",
				noMatches: "Inga matchande sessioner",
				noSessions: "Inga sessioner ännu",
				noWorkspaces: "Inga arbetsytor ännu",
				loading: "Läser in arbetsytor…",
				rename: "Byt namn",
				renameWorkspace: "Byt namn på arbetsyta",
				renameSession: "Byt namn på session",
				deleteWorkspace: "Ta bort arbetsyta",
				deleteDescription: "Detta tar bort “{name}” från arbetsytelistan. Mappen och sessionsloggarna behålls.",
				fork: "Förgrena session",
				archive: "Arkivera session",
				archiveMode: "Arkivläge",
				deleteMode: "Raderingsläge",
				deleteSession: "Ta bort session",
				deleteSessionTitle: "Ta bort session",
				deleteSessionConfirm: "Är du säker på att du vill ta bort denna session? Den tas bort från listan. Detta kan inte ångras.",
				toggleActionMode: "Växla arkiv-/raderingsläge",
				actionModeLabel: "Sessionsåtgärd",
				cancel: "Avbryt",
				confirm: "Bekräfta",
				retry: "Välj igen",
				folderError: "Kunde inte öppna mappen",
				workspaceName: "Arbetsytans namn",
				sessionName: "Sessionens namn",
				count: "{n} sessioner",
				now: "just nu",
				minutes: "{n} min",
				hours: "{n} tim",
				days: "{n} dgr",
				months: "{n} mån",
				years: "{n} år",
				running: "Pågår",
				waiting: "Väntar på interaktion",
				completed: "Slutförd",
				collapse: "Fäll ihop",
				expand: "Fäll ut",
				today: "Idag",
				yesterday: "Igår",
				date: "{d}/{m}",
				dateYear: "{d}/{m}/{y}"
			},
			pl: {
				workspaces: "Obszary robocze",
				sessions: "Sesje",
				recent: "Ostatnie sesje",
				ungrouped: "Niezgrupowane",
				newSession: "Nowa sesja",
				addWorkspace: "Dodaj obszar roboczy",
				addWorkspaceMenu: "Dodaj obszar roboczy…",
				search: "Szukaj sesji",
				searchPlaceholder: "Szukaj nazwy, słów kluczowych…",
				clearSearch: "Wyczyść wyszukiwanie",
				searching: "Trwa przeszukiwanie historii sesji…",
				searchUnavailable: "Wyszukiwanie treści jest niedostępne. Pokazujemy tylko dopasowania nazw.",
				noMatches: "Brak pasujących sesji",
				noSessions: "Brak sesji",
				noWorkspaces: "Brak obszarów roboczych",
				loading: "Wczytywanie obszarów roboczych…",
				rename: "Zmień nazwę",
				renameWorkspace: "Zmień nazwę obszaru roboczego",
				renameSession: "Zmień nazwę sesji",
				deleteWorkspace: "Usuń obszar roboczy",
				deleteDescription: "Spowoduje usunięcie „{name}” z listy obszarów roboczych. Folder i logi sesji zostaną zachowane.",
				fork: "Rozwidlij sesję",
				archive: "Zarchiwizuj sesję",
				archiveMode: "Tryb archiwizacji",
				deleteMode: "Tryb usuwania",
				deleteSession: "Usuń sesję",
				deleteSessionTitle: "Usuń sesję",
				deleteSessionConfirm: "Na pewno usunąć tę sesję? Zostanie usunięta z listy. Tej operacji nie można cofnąć.",
				toggleActionMode: "Przełącz tryb archiwizacji/usuwania",
				actionModeLabel: "Akcja sesji",
				cancel: "Anuluj",
				confirm: "Potwierdź",
				retry: "Wybierz ponownie",
				folderError: "Nie można otworzyć folderu",
				workspaceName: "Nazwa obszaru roboczego",
				sessionName: "Nazwa sesji",
				count: "{n} sesji",
				now: "przed chwilą",
				minutes: "{n} min",
				hours: "{n} godz.",
				days: "{n} dni",
				months: "{n} mies.",
				years: "{n} lat",
				running: "W trakcie",
				waiting: "Oczekuje na interakcję",
				completed: "Zakończono",
				collapse: "Zwiń",
				expand: "Rozwiń",
				today: "Dzisiaj",
				yesterday: "Wczoraj",
				date: "{d}.{m}",
				dateYear: "{d}.{m}.{y}"
			},
			"zh-HK": {
				workspaces: "工作區",
				sessions: "會話",
				recent: "最近會話",
				ungrouped: "未分組",
				newSession: "新會話",
				addWorkspace: "新增工作區",
				addWorkspaceMenu: "新增工作區…",
				search: "搜尋會話",
				searchPlaceholder: "搜尋名稱、關鍵字…",
				clearSearch: "清除搜尋",
				searching: "正在搜尋會話記錄…",
				searchUnavailable: "內容搜尋暫時無法使用，僅顯示名稱相符項目。",
				noMatches: "無相符會話",
				noSessions: "暫無會話",
				noWorkspaces: "暫無工作區",
				loading: "正在載入工作區…",
				rename: "重新命名",
				renameWorkspace: "重新命名工作區",
				renameSession: "重新命名會話",
				deleteWorkspace: "刪除工作區",
				deleteDescription: "會將「{name}」從工作區清單中移除。資料夾與會話記錄會保留。",
				fork: "分叉會話",
				archive: "封存會話",
				archiveMode: "封存模式",
				deleteMode: "刪除模式",
				deleteSession: "刪除會話",
				deleteSessionTitle: "刪除會話",
				deleteSessionConfirm: "確定要刪除此會話嗎？刪除後會從清單中移除，此操作無法復原。",
				toggleActionMode: "切換封存/刪除模式",
				actionModeLabel: "會話操作",
				cancel: "取消",
				confirm: "確認",
				retry: "重新選擇",
				folderError: "無法開啟資料夾",
				workspaceName: "工作區名稱",
				sessionName: "會話名稱",
				count: "{n} 個會話",
				now: "剛剛",
				minutes: "{n}分鐘",
				hours: "{n}小時",
				days: "{n}天",
				months: "{n}個月",
				years: "{n}年",
				running: "進行中",
				waiting: "等待互動",
				completed: "已完成",
				collapse: "摺疊",
				expand: "展開",
				today: "今天",
				yesterday: "昨天",
				date: "{m}月{d}日",
				dateYear: "{y}年{m}月{d}日"
			},
			"zh-TW": {
				workspaces: "工作區",
				sessions: "對話",
				recent: "最近對話",
				ungrouped: "未分組",
				newSession: "新對話",
				addWorkspace: "新增工作區",
				addWorkspaceMenu: "新增工作區…",
				search: "搜尋對話",
				searchPlaceholder: "搜尋名稱、關鍵字…",
				clearSearch: "清除搜尋",
				searching: "正在搜尋對話紀錄…",
				searchUnavailable: "內容搜尋暫時無法使用，僅顯示名稱相符項目。",
				noMatches: "沒有相符的對話",
				noSessions: "尚無對話",
				noWorkspaces: "尚無工作區",
				loading: "正在載入工作區…",
				rename: "重新命名",
				renameWorkspace: "重新命名工作區",
				renameSession: "重新命名對話",
				deleteWorkspace: "刪除工作區",
				deleteDescription: "會將「{name}」從工作區清單中移除。資料夾與對話紀錄會保留。",
				fork: "分叉對話",
				archive: "封存對話",
				archiveMode: "封存模式",
				deleteMode: "刪除模式",
				deleteSession: "刪除對話",
				deleteSessionTitle: "刪除對話",
				deleteSessionConfirm: "確定要刪除此對話嗎？刪除後會從清單中移除，此操作無法復原。",
				toggleActionMode: "切換封存/刪除模式",
				actionModeLabel: "對話操作",
				cancel: "取消",
				confirm: "確認",
				retry: "重新選擇",
				folderError: "無法開啟資料夾",
				workspaceName: "工作區名稱",
				sessionName: "對話名稱",
				count: "{n} 個對話",
				now: "剛剛",
				minutes: "{n}分鐘",
				hours: "{n}小時",
				days: "{n}天",
				months: "{n}個月",
				years: "{n}年",
				running: "進行中",
				waiting: "等待互動",
				completed: "已完成",
				collapse: "摺疊",
				expand: "展開",
				today: "今天",
				yesterday: "昨天",
				date: "{m}月{d}日",
				dateYear: "{y}年{m}月{d}日"
			},
			"zh-MO": {
				workspaces: "工作區",
				sessions: "會話",
				recent: "最近會話",
				ungrouped: "未分組",
				newSession: "新會話",
				addWorkspace: "新增工作區",
				addWorkspaceMenu: "新增工作區…",
				search: "搜尋會話",
				searchPlaceholder: "搜尋名稱、關鍵字…",
				clearSearch: "清除搜尋",
				searching: "正在搜尋會話記錄…",
				searchUnavailable: "內容搜尋暫時無法使用，僅顯示名稱相符項目。",
				noMatches: "無相符會話",
				noSessions: "暫無會話",
				noWorkspaces: "暫無工作區",
				loading: "正在載入工作區…",
				rename: "重新命名",
				renameWorkspace: "重新命名工作區",
				renameSession: "重新命名會話",
				deleteWorkspace: "刪除工作區",
				deleteDescription: "會將「{name}」從工作區清單中移除。資料夾與會話記錄會保留。",
				fork: "分叉會話",
				archive: "封存會話",
				archiveMode: "封存模式",
				deleteMode: "刪除模式",
				deleteSession: "刪除會話",
				deleteSessionTitle: "刪除會話",
				deleteSessionConfirm: "確定要刪除此會話嗎？刪除後會從清單中移除，此操作無法復原。",
				toggleActionMode: "切換封存/刪除模式",
				actionModeLabel: "會話操作",
				cancel: "取消",
				confirm: "確認",
				retry: "重新選擇",
				folderError: "無法開啟資料夾",
				workspaceName: "工作區名稱",
				sessionName: "會話名稱",
				count: "{n} 個會話",
				now: "剛剛",
				minutes: "{n}分鐘",
				hours: "{n}小時",
				days: "{n}天",
				months: "{n}個月",
				years: "{n}年",
				running: "進行中",
				waiting: "等待互動",
				completed: "已完成",
				collapse: "摺疊",
				expand: "展開",
				today: "今天",
				yesterday: "昨天",
				date: "{m}月{d}日",
				dateYear: "{y}年{m}月{d}日"
			}
		};
		//#endregion
		//#region src/client/locales.ts
		/** Product copy for the replacement workspace browser. */
		const zh = {
			workspaces: "工作区",
			sessions: "会话",
			recent: "最近会话",
			ungrouped: "未分组",
			newSession: "新会话",
			addWorkspace: "添加工作区",
			addWorkspaceMenu: "添加工作区…",
			search: "搜索会话",
			searchPlaceholder: "搜索名称、关键词…",
			clearSearch: "清除搜索",
			searching: "正在搜索会话历史…",
			searchUnavailable: "内容搜索暂不可用，仅显示名称匹配。",
			noMatches: "无匹配会话",
			noSessions: "暂无会话",
			noWorkspaces: "暂无工作区",
			loading: "正在加载工作区…",
			rename: "重命名",
			renameWorkspace: "重命名工作区",
			renameSession: "重命名会话",
			deleteWorkspace: "删除工作区",
			deleteDescription: "将把“{name}”从工作区列表中移除。文件夹与会话记录会保留。",
			fork: "分叉会话",
			archive: "归档会话",
			archiveMode: "归档模式",
			deleteMode: "删除模式",
			deleteSession: "删除会话",
			deleteSessionTitle: "删除会话",
			deleteSessionConfirm: "确定要删除此会话吗？删除后将从列表中移除，此操作不可撤销。",
			toggleActionMode: "切换归档/删除模式",
			actionModeLabel: "会话操作",
			cancel: "取消",
			confirm: "确认",
			retry: "重新选择",
			folderError: "无法打开文件夹",
			workspaceName: "工作区名称",
			sessionName: "会话名称",
			count: "{n} 个会话",
			now: "刚刚",
			minutes: "{n}分钟",
			hours: "{n}小时",
			days: "{n}天",
			months: "{n}个月",
			years: "{n}年",
			running: "进行中",
			waiting: "等待交互",
			completed: "已完成",
			collapse: "折叠",
			expand: "展开",
			today: "今天",
			yesterday: "昨天",
			date: "{m}月{d}日",
			dateYear: "{y}年{m}月{d}日"
		};
		const en = {
			workspaces: "Workspaces",
			sessions: "Sessions",
			recent: "Recent Sessions",
			ungrouped: "Ungrouped",
			newSession: "New Session",
			addWorkspace: "Add workspace",
			addWorkspaceMenu: "Add workspace…",
			search: "Search sessions",
			searchPlaceholder: "Search name, keywords...",
			clearSearch: "Clear search",
			searching: "Searching session history…",
			searchUnavailable: "Content search is unavailable. Showing name matches.",
			noMatches: "No matching sessions",
			noSessions: "No sessions yet",
			noWorkspaces: "No workspaces yet",
			loading: "Loading workspaces…",
			rename: "Rename",
			renameWorkspace: "Rename workspace",
			renameSession: "Rename session",
			deleteWorkspace: "Delete workspace",
			deleteDescription: "This removes “{name}” from the workspace list. The folder and session logs remain.",
			fork: "Fork session",
			archive: "Archive session",
			archiveMode: "Archive mode",
			deleteMode: "Delete mode",
			deleteSession: "Delete session",
			deleteSessionTitle: "Delete session",
			deleteSessionConfirm: "Are you sure you want to delete this session? It will be removed from the list. This cannot be undone.",
			toggleActionMode: "Toggle archive/delete mode",
			actionModeLabel: "Session action",
			cancel: "Cancel",
			confirm: "Confirm",
			retry: "Choose again",
			folderError: "Couldn’t open folder",
			workspaceName: "Workspace name",
			sessionName: "Session name",
			count: "{n} sessions",
			now: "now",
			minutes: "{n}min",
			hours: "{n}h",
			days: "{n}d",
			months: "{n}mo",
			years: "{n}y",
			running: "Running",
			waiting: "Waiting for interaction",
			completed: "Completed",
			collapse: "Collapse",
			expand: "Expand",
			today: "Today",
			yesterday: "Yesterday",
			date: "{m}/{d}",
			dateYear: "{m}/{d}/{y}"
		};
		const NS = "ya-workspace-sidebar";
		//#endregion
		//#region src/client/navigation.ts
		/**
		* Stand-in for the `uiWorkspace` navigation service owned by the official
		* ui-workspace client entry, which this bundle's patch disables.
		*
		* Since DSH v0.1.2-alpha.1 the ui-sidebar, ui-conversation, ui-agent-preset,
		* and the composed directory-picker client entries all inject `uiWorkspace`;
		* without a provider their fibers park forever and the whole WebUI boot
		* deadlocks. This port carries the semantics that moved here from the
		* pre-split client runtime: reuse-or-create Workspace connection, the
		* explicit/current/recent New Session fallback, archived-current clearing,
		* boot auto-selection, and the directory-picking wire calls.
		*/
		/** Implements Workspace navigation and directory UI operations. */
		var YaWorkspaceNavigation = class extends _deepseek_ai_cordis.Service {
			directoryPicker;
			workspaces;
			sessions;
			connecting = /* @__PURE__ */ new Map();
			/**
			* @param ctx - Client root Context.
			* @param directoryPicker - the directory-picking Remote namespace.
			* @param workspaces - pure Workspace Controller.
			* @param sessions - pure Session Controller.
			*/
			constructor(ctx, directoryPicker, workspaces, sessions) {
				super(ctx, "uiWorkspace");
				this.directoryPicker = directoryPicker;
				this.workspaces = workspaces;
				this.sessions = sessions;
				ctx.effect(() => this.watchNavigation(), "ya-workspace-sidebar: Workspace navigation policy");
			}
			async connectWorkspace(workspaceId) {
				const workspace = this.workspaces.list.getSnapshot().items.find((item) => item.workspaceId === workspaceId);
				if (workspace === void 0) throw new Error(`ya-workspace-sidebar: unknown workspace "${workspaceId}"`);
				const inflight = this.connecting.get(workspaceId);
				if (inflight !== void 0) return inflight;
				const archived = this.workspaces.list.getSnapshot().archivedSessionIds;
				const sessions = this.sessions.list.getSnapshot();
				for (const id of sessions.ids) {
					const summary = sessions.byId[id];
					if (summary !== void 0 && summary.blank && summary.cwd === workspace.path && workspace.sessionIds.includes(summary.id) && !archived.includes(summary.id)) return summary.id;
				}
				const attempt = this.sessions.create({ workspaceId }).finally(() => {
					this.connecting.delete(workspaceId);
				});
				this.connecting.set(workspaceId, attempt);
				return attempt;
			}
			startSession(workspaceId) {
				const workspaces = this.workspaces.list.getSnapshot();
				const sessions = this.sessions.list.getSnapshot();
				const current = sessions.current;
				const currentWorkspaceId = current === void 0 ? void 0 : workspaces.items.find((item) => item.sessionIds.includes(current))?.workspaceId;
				const recent = workspaces.phase === "ready" && sessions.phase === "ready" ? recentWorkspace(workspaces.items, sessions.byId) : void 0;
				const target = workspaceId ?? currentWorkspaceId ?? recent;
				if (target === void 0) {
					this.sessions.clear();
					return;
				}
				this.connectWorkspace(target).then((sessionId) => {
					this.sessions.open(sessionId);
				}, (reason) => {
					console.warn("ya-workspace-sidebar: new session failed:", reason);
				});
			}
			async archiveSession(sessionId) {
				await this.workspaces.archiveSession(sessionId);
			}
			async pickDirectory() {
				const result = await this.directoryPicker.pick();
				if (!result.ok) throw new Error(`directory picker failed: ${result.error.message}`);
				return result.value;
			}
			async listDirectory(path, signal) {
				const result = await this.directoryPicker.list(path, signal);
				if (!result.ok) throw new Error(`directory browse failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			}
			async createDirectory(path, name) {
				const result = await this.directoryPicker.createDirectory(path, name);
				if (!result.ok) throw new Error(`directory browse failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			}
			watchNavigation() {
				let initial = "waiting";
				let disposed = false;
				const reconcile = () => {
					if (disposed) return;
					if (this.clearArchivedCurrent()) return;
					if (initial !== "waiting") return;
					const workspaces = this.workspaces.list.getSnapshot();
					const sessions = this.sessions.list.getSnapshot();
					if (workspaces.phase !== "ready" || sessions.phase !== "ready") return;
					if (sessions.current !== void 0) {
						initial = "done";
						return;
					}
					const target = recentWorkspace(workspaces.items, sessions.byId);
					if (target === void 0) {
						initial = "done";
						return;
					}
					initial = "connecting";
					this.connectWorkspace(target).then((sessionId) => {
						if (disposed) return;
						if (this.sessions.list.getSnapshot().current === void 0) this.sessions.open(sessionId);
						initial = "done";
					}, (reason) => {
						if (disposed) return;
						initial = "waiting";
						console.warn("ya-workspace-sidebar: initial workspace selection failed:", reason);
					});
				};
				const disposeWorkspaces = this.workspaces.list.subscribe(reconcile);
				const disposeSessions = this.sessions.list.subscribe(reconcile);
				reconcile();
				return () => {
					disposed = true;
					disposeSessions();
					disposeWorkspaces();
				};
			}
			/** @returns true when an archived current selection was cleared. */
			clearArchivedCurrent() {
				const current = this.sessions.list.getSnapshot().current;
				if (current === void 0 || !this.workspaces.list.getSnapshot().archivedSessionIds.includes(current)) return false;
				this.sessions.clear();
				return true;
			}
		};
		/** Stable tie-breaking follows Host Workspace order. */
		function recentWorkspace(workspaces, sessions) {
			let selected;
			let selectedTime = Number.NEGATIVE_INFINITY;
			for (const workspace of workspaces) {
				let latest = Number.NEGATIVE_INFINITY;
				for (const sessionId of workspace.sessionIds) {
					const session = sessions[sessionId];
					if (session !== void 0) latest = Math.max(latest, session.updatedAt);
				}
				if (latest === Number.NEGATIVE_INFINITY) latest = Date.parse(workspace.createdAt);
				if (selected === void 0 || latest > selectedTime) {
					selected = workspace.workspaceId;
					selectedTime = latest;
				}
			}
			return selected;
		}
		//#endregion
		//#region src/client/styles.ts
		/** One scoped stylesheet injected for the lifetime of the client activation. */
		const CSS = `
[data-ya-workspace-sidebar] { flex:1; min-height:0; display:flex; flex-direction:column; box-sizing:border-box; padding-right:var(--dsh-sidebar-inline-padding); color:var(--dsw-alias-label-primary); }
[data-ya-workspace-sidebar].ya-rail { padding-right:0; }
.ya-section-header { flex:none; height:36px; display:flex; align-items:center; justify-content:flex-end; gap:4px; padding-left:12px; margin-bottom:4px; box-sizing:border-box; color:var(--dsw-alias-label-tertiary); }
.ya-section-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; }
.ya-icon-button { flex:none; width:28px; height:28px; border:0; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center; color:var(--dsw-alias-label-secondary); background:transparent; cursor:pointer; }
.ya-icon-button:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ya-search { flex:none; height:38px; margin:0 2px 10px; padding:0 14px; display:flex; align-items:center; gap:8px; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l2); border-radius:24px; background:var(--dsw-static-neutral-bluish-75); color:var(--dsw-alias-label-caption); }
body[data-ds-dark-theme] .ya-search { background:var(--dsw-static-neutral-bluish-900); }
.ya-search-input { flex:1; min-width:0; border:0; outline:0; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:14px; }
.ya-search-input::placeholder { color:var(--dsw-alias-label-tertiary); }
.ya-search-icon { flex:none; display:inline-flex; border:0; padding:0; color:inherit; background:transparent; }
.ya-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; margin-right:calc(-1 * var(--dsh-sidebar-inline-padding)); padding-right:var(--dsh-sidebar-inline-padding); }
.ya-recent { flex:none; padding-bottom:8px; border-bottom:1px solid var(--dsw-alias-border-l2); }
.ya-recent-collapsed { padding-bottom:0; border-bottom-color:transparent; }
.ya-recent-list-wrap { display:grid; grid-template-rows:1fr; transition:grid-template-rows 220ms ease-out; }
.ya-recent-collapsed .ya-recent-list-wrap { grid-template-rows:0fr; }
.ya-recent-list { display:flex; flex-direction:column; overflow:hidden; min-height:0; }
.ya-block-label { height:26px; display:flex; align-items:center; gap:2px; padding:0 8px; color:var(--dsw-alias-label-tertiary); font-size:12px; font-weight:600; letter-spacing:.02em; text-transform:uppercase; }
.ya-block-label-toggle { flex:none; width:20px; height:20px; margin-left:auto; border:0; border-radius:6px; padding:0; display:inline-flex; align-items:center; justify-content:center; background:transparent; color:var(--dsw-alias-label-tertiary); cursor:pointer; transition:transform 180ms ease-out; }
.ya-block-label-toggle:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-secondary); }
.ya-block-label-toggle.ya-collapsed { transform:rotate(-90deg); }
.ya-date-group-label { height:26px; display:flex; align-items:center; padding:0 8px; color:var(--dsw-alias-label-tertiary); font-size:12px; font-weight:600; letter-spacing:.02em; }
.ya-breadcrumb { flex:none; height:34px; display:flex; align-items:center; gap:2px; padding:0 6px; color:var(--dsw-alias-label-tertiary); font-size:13px; }
.ya-crumb { border:0; padding:4px 3px; border-radius:6px; background:transparent; color:inherit; font:inherit; cursor:default; min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
button.ya-crumb:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); cursor:pointer; }
.ya-scroll { flex:1; min-height:0; overflow-y:auto; padding-bottom:12px; }
.ya-row { position:relative; min-height:34px; display:flex; align-items:center; gap:6px; margin:1px 0; padding:0 7px; border-radius:9px; box-sizing:border-box; color:var(--dsw-alias-label-primary); cursor:pointer; user-select:none; }
.ya-row:hover, .ya-row.ya-menu-open { background:var(--dsw-alias-interactive-bg-hover); }
.ya-row.ya-selected { background:var(--dsw-alias-interactive-bg-selected); }
.ya-workspace-row { min-height:40px; }
.ya-row-main { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; }
.ya-row-line { display:flex; align-items:center; min-width:0; gap:6px; }
.ya-row-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; line-height:18px; }
.ya-row-meta { flex:none; color:var(--dsw-alias-label-tertiary); font-size:11px; white-space:nowrap; }
.ya-workspace-path { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-tertiary); font-size:11px; line-height:15px; }
.ya-row-actions { flex:none; display:flex; align-items:center; gap:2px; opacity:0; pointer-events:none; transition:opacity 120ms ease-out; }
.ya-row:hover .ya-row-actions, .ya-menu-open .ya-row-actions { opacity:1; pointer-events:auto; }
.ya-status-slot { flex:none; width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; color:var(--dsw-alias-label-tertiary); }
.ya-recent .ya-row { min-height:31px; }
.ya-search-workspace { color:var(--dsw-alias-label-tertiary); font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ya-empty, .ya-status { padding:18px 10px; color:var(--dsw-alias-label-tertiary); text-align:center; font-size:13px; }
.ya-warning { color:var(--dsw-alias-status-warning); }
.ya-rename-input { width:100%; height:38px; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l2); border-radius:9px; padding:0 11px; background:transparent; color:var(--dsw-alias-label-primary); outline:none; }
.ya-error { margin-top:8px; color:var(--dsw-alias-status-error); font-size:12px; }
.ya-rail .ya-section-header { padding-left:0; margin-bottom:12px; }
.ya-rail .ya-icon-button, .ya-rail .ya-search { width:36px; height:36px; padding:0; margin:0 0 12px; border-color:transparent; background:transparent; }
.ya-rail .ya-search { justify-content:center; }
.ya-rail .ya-search-icon { cursor:pointer; color:var(--dsw-alias-label-primary); }
.ya-picker-error { color:var(--dsw-alias-status-error); white-space:pre-wrap; }
.ya-action-mode-toggle.ya-action-mode-delete { color:var(--dsw-alias-state-error-primary); }
.ya-action-mode-toggle.ya-action-mode-delete:hover { background:var(--dsw-alias-interactive-bg-hover-danger); }
@keyframes ya-slide-in-forward { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
@keyframes ya-slide-in-backward { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
.ya-level-enter-forward { animation:ya-slide-in-forward 180ms ease-out; }
.ya-level-enter-backward { animation:ya-slide-in-backward 180ms ease-out; }
`;
		/** Install the stylesheet and return its disposer. */
		function installStyles() {
			const style = document.createElement("style");
			style.setAttribute("data-ya-workspace-sidebar-style", "");
			style.textContent = CSS;
			document.head.appendChild(style);
			return () => {
				style.remove();
			};
		}
		//#endregion
		//#region src/client/WorkspacePicker.tsx
		const ADD = "::ya-add-workspace";
		/** Render the workspace target menu and directory picking conversation. */
		function WorkspacePickFlow({ t, open, anchorRef, useWorkspaces, createWorkspace, useDirectoryFlow, renderDirectoryFlow, onPick, onClose, addOnly = false, side = "bottom", selectedId }) {
			const snapshot = useWorkspaces((state) => state);
			const flowAvailable = useDirectoryFlow((value) => value);
			const [flowOpen, setFlowOpen] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const getAnchorRect = (0, react.useCallback)(() => anchorRef?.current?.getBoundingClientRect() ?? null, [anchorRef]);
			(0, react.useEffect)(() => {
				if (flowOpen && !flowAvailable) setFlowOpen(false);
			}, [flowAvailable, flowOpen]);
			const openFlow = (0, react.useCallback)(() => {
				onClose();
				setError(null);
				setFlowOpen(true);
			}, [onClose]);
			const addEntries = flowAvailable ? [{
				id: ADD,
				label: t("addWorkspaceMenu"),
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 16 }),
				disabled: flowOpen || busy
			}] : [];
			const pinnedAdd = !addOnly && snapshot.items.length > 0;
			const items = pinnedAdd ? snapshot.items.map((workspace) => ({
				id: workspace.workspaceId,
				label: workspace.title,
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderClose16, { size: 16 }),
				disabled: flowOpen || busy
			})) : addEntries;
			const settled = addOnly || snapshot.phase === "ready";
			const onlyAdd = !pinnedAdd && settled && addEntries.length === 1;
			(0, react.useEffect)(() => {
				if (open && onlyAdd && !flowOpen && !busy) openFlow();
			}, [
				busy,
				flowOpen,
				onlyAdd,
				open,
				openFlow
			]);
			const owner = {
				open: flowOpen,
				busy,
				onPicked: (path) => {
					setBusy(true);
					createWorkspace({ path }).then((workspace) => {
						setFlowOpen(false);
						onPick(workspace.workspaceId);
					}).catch((reason) => {
						setFlowOpen(false);
						setError(reason instanceof Error ? reason.message : String(reason));
					}).finally(() => {
						setBusy(false);
					});
				},
				onCancel: () => {
					setFlowOpen(false);
				},
				onError: (message) => {
					setFlowOpen(false);
					setError(message);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open: open && !onlyAdd && items.length > 0,
					anchor: null,
					items,
					...pinnedAdd ? { footer: addEntries } : {},
					selectedId,
					onSelect: (id) => {
						if (id === ADD) openFlow();
						else onPick(id);
					},
					onClose,
					side,
					portal: true,
					getAnchorRect
				}),
				open && !onlyAdd && snapshot.phase === "pending" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "ya-status",
					children: t("loading")
				}),
				renderDirectoryFlow(owner),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: error !== null,
					onClose: () => {
						setError(null);
					},
					closeLabel: t("cancel"),
					title: t("folderError"),
					footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: () => {
							setError(null);
						},
						children: t("cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						disabled: !flowAvailable,
						onClick: openFlow,
						children: t("retry")
					})] }),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "ya-picker-error",
						role: "alert",
						children: error
					})
				})
			] });
		}
		/** Fill the conversation hero's workspace picker seat. */
		function WorkspacePicker({ open, anchorRef, useWorkspaces, selectedId, onPick, onClose, createWorkspace, useDirectoryFlow, renderSlot, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkspacePickFlow, {
				t,
				open,
				anchorRef,
				useWorkspaces,
				selectedId,
				onPick,
				onClose,
				createWorkspace,
				useDirectoryFlow,
				renderDirectoryFlow: (owner) => renderSlot("conversation.hero.workspace.directoryFlow", owner)
			});
		}
		//#endregion
		//#region src/client/model.ts
		/** Resolve the visible status-dot kind for one session, if any. */
		function pendingKindOf(pending, id) {
			const kind = pending.get(id)?.kind;
			return kind === "approval" || kind === "plan-review" || kind === "question" ? kind : void 0;
		}
		/** Navigation key for sessions not accounted to a real workspace. */
		const UNGROUPED = "__ya_ungrouped__";
		function visible(summary, current, archived) {
			return summary.origin !== "subagent" && !archived.has(summary.id) && (!summary.blank || summary.id === current);
		}
		function rowOf(summary, workspaceKey, workspaceTitle, pending) {
			const pendingInteraction = pendingKindOf(pending, summary.id);
			return {
				id: summary.id,
				title: summary.blank ? "New Session" : summary.displayTitle,
				blank: summary.blank,
				running: summary.running,
				...pendingInteraction === void 0 ? {} : { pendingInteraction },
				completed: summary.completed === true,
				updatedAt: summary.updatedAt,
				workspaceKey,
				workspaceTitle
			};
		}
		function ownerIndex(workspaces) {
			const result = /* @__PURE__ */ new Map();
			for (const workspace of workspaces) for (const sessionId of workspace.sessionIds) result.set(sessionId, workspace);
			return result;
		}
		/** Resolve the first/second-level destination for one session. */
		function workspaceKeyForSession(sessionId, workspaces) {
			if (sessionId === void 0) return null;
			return ownerIndex(workspaces).get(sessionId)?.workspaceId ?? "__ya_ungrouped__";
		}
		/** Derive global recent sessions, newest first. */
		function deriveRecent(list, workspaces, archivedSessionIds, pending, limit = 5) {
			const archived = new Set(archivedSessionIds);
			const owners = ownerIndex(workspaces);
			return list.ids.map((id) => list.byId[id]).filter((summary) => summary !== void 0 && visible(summary, list.current, archived)).sort((a, b) => b.updatedAt - a.updatedAt || String(a.id).localeCompare(String(b.id))).slice(0, limit).map((summary) => {
				const workspace = owners.get(summary.id);
				return rowOf(summary, workspace?.workspaceId ?? "__ya_ungrouped__", workspace?.title ?? "Ungrouped", pending);
			});
		}
		function lastUsedOf(timestamps, fallback) {
			let newest;
			for (const ts of timestamps) if (newest === void 0 || ts > newest) newest = ts;
			if (newest !== void 0) return newest;
			if (fallback === void 0) return void 0;
			const created = Date.parse(fallback);
			return Number.isNaN(created) ? void 0 : created;
		}
		/** Derive first-level workspaces plus Ungrouped, newest session activity first. */
		function deriveWorkspaces(list, workspaces, archivedSessionIds) {
			const archived = new Set(archivedSessionIds);
			const accounted = /* @__PURE__ */ new Set();
			const result = workspaces.map((workspace) => {
				let count = 0;
				const timestamps = [];
				for (const id of workspace.sessionIds) {
					accounted.add(id);
					const summary = list.byId[id];
					if (summary !== void 0 && visible(summary, list.current, archived)) {
						count++;
						timestamps.push(summary.updatedAt);
					}
				}
				const lastUsedAt = lastUsedOf(timestamps, workspace.createdAt);
				return {
					key: workspace.workspaceId,
					title: workspace.title,
					path: workspace.path,
					createdAt: workspace.createdAt,
					...lastUsedAt === void 0 ? {} : { lastUsedAt },
					count,
					real: true
				};
			});
			let ungrouped = 0;
			const ungroupedTimestamps = [];
			for (const id of list.ids) {
				const summary = list.byId[id];
				if (summary !== void 0 && !accounted.has(id) && visible(summary, list.current, archived)) {
					ungrouped++;
					ungroupedTimestamps.push(summary.updatedAt);
				}
			}
			const ungroupedLastUsed = lastUsedOf(ungroupedTimestamps);
			result.push({
				key: UNGROUPED,
				title: "Ungrouped",
				count: ungrouped,
				real: false,
				...ungroupedLastUsed === void 0 ? {} : { lastUsedAt: ungroupedLastUsed }
			});
			result.sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0) || String(a.key).localeCompare(String(b.key)));
			return result;
		}
		/** Derive the selected workspace's sessions in its canonical order. */
		function deriveWorkspaceSessions(key, list, workspaces, archivedSessionIds, pending) {
			const archived = new Set(archivedSessionIds);
			if (key === "__ya_ungrouped__") {
				const accounted = new Set(workspaces.flatMap((workspace) => workspace.sessionIds));
				return list.ids.map((id) => list.byId[id]).filter((summary) => summary !== void 0 && !accounted.has(summary.id) && visible(summary, list.current, archived)).sort((a, b) => b.updatedAt - a.updatedAt || String(a.id).localeCompare(String(b.id))).map((summary) => rowOf(summary, UNGROUPED, "Ungrouped", pending));
			}
			const workspace = workspaces.find((item) => item.workspaceId === key);
			if (workspace === void 0) return [];
			return workspace.sessionIds.map((id) => list.byId[id]).filter((summary) => summary !== void 0 && visible(summary, list.current, archived)).map((summary) => rowOf(summary, workspace.workspaceId, workspace.title, pending));
		}
		/** Format a local calendar date as `YYYY-MM-DD` (locale-agnostic, no padding surprises). */
		function localDateKey(year, month, day) {
			return `${year}-${month < 9 ? `0${month + 1}` : `${month + 1}`}-${day < 10 ? `0${day}` : `${day}`}`;
		}
		/** Whole-day difference between two local calendar dates (a - b) using UTC midnight. */
		function dayDiff(a, b) {
			const msA = Date.UTC(a.year, a.month, a.day);
			const msB = Date.UTC(b.year, b.month, b.day);
			return Math.round((msA - msB) / 864e5);
		}
		function groupByLocalDate(rows, timestampOf, compare, now) {
			if (rows.length === 0) return [];
			const nowDate = new Date(now);
			const today = {
				year: nowDate.getFullYear(),
				month: nowDate.getMonth(),
				day: nowDate.getDate()
			};
			const buckets = /* @__PURE__ */ new Map();
			for (const row of rows) {
				const ts = Math.min(timestampOf(row), now);
				const d = new Date(ts);
				const date = {
					year: d.getFullYear(),
					month: d.getMonth(),
					day: d.getDate()
				};
				const dateKey = localDateKey(date.year, date.month, date.day);
				let bucket = buckets.get(dateKey);
				if (bucket === void 0) {
					bucket = {
						dayOffset: Math.max(0, dayDiff(today, date)),
						rows: []
					};
					buckets.set(dateKey, bucket);
				}
				bucket.rows.push(row);
			}
			const groups = [];
			for (const [dateKey, bucket] of buckets) {
				bucket.rows.sort(compare);
				groups.push({
					dateKey,
					dayOffset: bucket.dayOffset,
					rows: bucket.rows
				});
			}
			groups.sort((a, b) => a.dayOffset - b.dayOffset || a.dateKey.localeCompare(b.dateKey));
			return groups;
		}
		/**
		* Derive the selected real workspace's sessions grouped by local calendar date.
		*
		* - Only real workspaces: `Ungrouped` falls back to {@link deriveWorkspaceSessions}.
		* - Groups are ordered by date descending; rows within a group by `updatedAt` descending.
		* - {@link visible} filter is reused (archived / subagent / blank visibility).
		* - Future timestamps clamp to today's bucket (`dayOffset` 0).
		* - `now` is the reference timestamp for "today"; pass `Date.now()` in production.
		*/
		function deriveWorkspaceSessionGroups(key, list, workspaces, archivedSessionIds, pending, now) {
			if (key === "__ya_ungrouped__") return [];
			const workspace = workspaces.find((item) => item.workspaceId === key);
			if (workspace === void 0) return [];
			const archived = new Set(archivedSessionIds);
			return groupByLocalDate(workspace.sessionIds.map((id) => list.byId[id]).filter((summary) => summary !== void 0 && visible(summary, list.current, archived)).map((summary) => rowOf(summary, workspace.workspaceId, workspace.title, pending)), (row) => row.updatedAt, (a, b) => b.updatedAt - a.updatedAt || String(a.id).localeCompare(String(b.id)), now);
		}
		/** Group root workspace rows by local calendar date of `lastUsedAt`; undated rows trail with empty `dateKey`. */
		function deriveWorkspaceGroups(rows, now) {
			const dated = [];
			const undated = [];
			for (const row of rows) if (row.lastUsedAt === void 0) undated.push(row);
			else dated.push(row);
			const groups = groupByLocalDate(dated, (row) => row.lastUsedAt ?? 0, (a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0) || String(a.key).localeCompare(String(b.key)), now);
			if (undated.length > 0) groups.push({
				dateKey: "",
				dayOffset: Number.POSITIVE_INFINITY,
				rows: [...undated]
			});
			return groups;
		}
		/** Case-insensitive local title/workspace matching used beside Host content search. */
		function localMatches(rows, query) {
			const normalized = query.trim().toLocaleLowerCase();
			if (normalized === "") return [];
			return rows.filter((row) => `${row.title}\n${row.workspaceTitle}`.toLocaleLowerCase().includes(normalized));
		}
		//#endregion
		//#region src/client/settings.ts
		const STORAGE_KEY = "ya-workspace-sidebar:action-mode";
		const listeners = /* @__PURE__ */ new Set();
		let currentMode = loadMode();
		/** Read the stored preference, falling back to `archive` on any failure. */
		function loadMode() {
			try {
				return window.localStorage.getItem(STORAGE_KEY) === "delete" ? "delete" : "archive";
			} catch {
				return "archive";
			}
		}
		/** Persist the preference; silently ignores quota or privacy-mode failures. */
		function persistMode(mode) {
			try {
				window.localStorage.setItem(STORAGE_KEY, mode);
			} catch {}
		}
		/** Current action mode snapshot. */
		function getActionMode() {
			return currentMode;
		}
		/** Switch the action mode and notify subscribers. */
		function setActionMode(mode) {
			if (mode === currentMode) return;
			currentMode = mode;
			persistMode(mode);
			for (const listener of [...listeners]) listener();
		}
		/** Subscribe to action mode changes; returns an unsubscribe disposer. */
		function subscribeActionMode(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		//#endregion
		//#region src/client/WorkspaceSidebar.tsx
		/** Two-level workspace/session browser with a persistent global recent block. */
		const SEARCH_DEBOUNCE_MS = 250;
		const SEARCH_MAX = 500;
		function sanitized(value) {
			return value.replaceAll("\0", "").slice(0, SEARCH_MAX);
		}
		function relativeTime(updatedAt, now, t) {
			const diff = Math.max(0, now - updatedAt);
			const minute = 6e4;
			if (diff < minute) return t("now");
			if (diff < 60 * minute) return t("minutes", { n: Math.floor(diff / minute) });
			if (diff < 1440 * minute) return t("hours", { n: Math.floor(diff / (60 * minute)) });
			if (diff < 43200 * minute) return t("days", { n: Math.floor(diff / (1440 * minute)) });
			if (diff < 525600 * minute) return t("months", { n: Math.floor(diff / (43200 * minute)) });
			return t("years", { n: Math.floor(diff / (525600 * minute)) });
		}
		/** Format a date group's localized title from its dayOffset and `YYYY-MM-DD` key. */
		function dateGroupLabel(group, now, t) {
			if (group.dayOffset === 0) return t("today");
			if (group.dayOffset === 1) return t("yesterday");
			const parts = group.dateKey.split("-");
			const year = Number(parts[0]);
			const month = Number(parts[1]);
			const day = Number(parts[2]);
			if (year === new Date(now).getFullYear()) return t("date", {
				m: month,
				d: day
			});
			return t("dateYear", {
				y: year,
				m: month,
				d: day
			});
		}
		function SessionStatus({ row }) {
			if (row.pendingInteraction !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "warning" });
			if (row.running) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" });
			if (row.completed) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "done" });
			return null;
		}
		function SessionItem({ row, current, now, open, rename, fork, archive, t, context, actionMode }) {
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const title = row.blank ? t("newSession") : row.title;
			const isDelete = actionMode === "delete";
			const actionLabel = isDelete ? t("deleteSession") : t("archive");
			const actionIcon = isDelete ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutline20, { size: 16 });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `ya-row${row.id === current ? " ya-selected" : ""}${menuOpen ? " ya-menu-open" : ""}`,
				role: "treeitem",
				"aria-selected": row.id === current,
				onClick: () => {
					open(row.id);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "ya-status-slot",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionStatus, { row })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "ya-row-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "ya-row-line",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-row-title",
								children: title
							}), !row.blank && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-row-meta ya-row-time",
								children: relativeTime(row.updatedAt, now, t)
							})]
						}), context === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "ya-search-workspace",
							children: row.workspaceTitle
						})]
					}),
					!row.blank && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "ya-row-actions",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
							open: menuOpen,
							onClose: () => {
								setMenuOpen(false);
							},
							items: [
								{
									id: "rename",
									label: t("rename"),
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, {})
								},
								{
									id: "fork",
									label: t("fork"),
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, {})
								},
								{
									id: "archive",
									label: actionLabel,
									icon: actionIcon,
									danger: isDelete
								}
							],
							onSelect: (id) => {
								setMenuOpen(false);
								if (id === "rename") rename(row);
								if (id === "fork") fork(row.id);
								if (id === "archive") archive(row.id);
							},
							portal: true,
							closeOnPointerLeave: true,
							anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ya-icon-button",
								"aria-label": `${title} actions`,
								onClick: (event) => {
									event.stopPropagation();
									setMenuOpen((value) => !value);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutline16, {})
							})
						})
					})
				]
			});
		}
		function WorkspaceItem({ row, enter, create, rename, remove, now, t }) {
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `ya-row ya-workspace-row${menuOpen ? " ya-menu-open" : ""}`,
				role: "treeitem",
				onClick: enter,
				title: row.path,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "ya-status-slot",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderClose16, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "ya-row-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "ya-row-line",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-row-title",
								children: row.real ? row.title : t("ungrouped")
							}), row.lastUsedAt !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-row-meta ya-row-time",
								children: relativeTime(row.lastUsedAt, now, t)
							})]
						}), row.path !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "ya-workspace-path",
							children: row.path
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "ya-row-actions",
						children: [row.real && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
							open: menuOpen,
							onClose: () => {
								setMenuOpen(false);
							},
							items: [{
								id: "rename",
								label: t("rename"),
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, {})
							}, {
								id: "delete",
								label: t("deleteWorkspace"),
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, {}),
								danger: true
							}],
							onSelect: (id) => {
								setMenuOpen(false);
								if (id === "rename") rename();
								if (id === "delete") remove();
							},
							portal: true,
							closeOnPointerLeave: true,
							anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ya-icon-button",
								onClick: (event) => {
									event.stopPropagation();
									setMenuOpen((value) => !value);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutline16, {})
							})
						}), row.real && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ya-icon-button",
							onClick: (event) => {
								event.stopPropagation();
								create();
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, {})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, {})
				]
			});
		}
		/** Fill `sidebar.workspaces` with the replacement browser. */
		function WorkspaceSidebar(props) {
			const { wide, expandSidebar, useSessions, useSessionPendingInteraction, useWorkspaces, startSession, open, searchSessions, searchResultLimit, renameSession, forkSession, renameWorkspace, deleteWorkspace, archiveSession, createWorkspace, useDirectoryFlow, renderSlot, t } = props;
			const sessions = useSessions((state) => state);
			const workspaceState = useWorkspaces((state) => state);
			const workspaces = workspaceState.items;
			const archived = workspaceState.archivedSessionIds;
			const pendingInteractions = useSessionPendingInteraction((state) => state);
			const directoryFlowAvailable = useDirectoryFlow((value) => value);
			const allRows = (0, react.useMemo)(() => deriveRecent(sessions, workspaces, archived, pendingInteractions, Number.MAX_SAFE_INTEGER), [
				archived,
				pendingInteractions,
				sessions,
				workspaces
			]);
			const recent = allRows.slice(0, 5);
			const workspaceRows = (0, react.useMemo)(() => deriveWorkspaces(sessions, workspaces, archived), [
				archived,
				sessions,
				workspaces
			]);
			const now = Date.now();
			const workspaceGroups = (0, react.useMemo)(() => deriveWorkspaceGroups(workspaceRows, now), [workspaceRows, now]);
			const [selectedKey, setSelectedKey] = (0, react.useState)(null);
			const [direction, setDirection] = (0, react.useState)("forward");
			const [hasMounted, setHasMounted] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setHasMounted(true);
			}, []);
			const observedCurrent = (0, react.useRef)(void 0);
			const initialized = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				if (initialized.current && observedCurrent.current === sessions.current) return;
				initialized.current = true;
				observedCurrent.current = sessions.current;
				if (sessions.current !== void 0) {
					setDirection("forward");
					setSelectedKey(workspaceKeyForSession(sessions.current, workspaces));
				}
			}, [sessions.current, workspaces]);
			(0, react.useEffect)(() => {
				if (selectedKey !== null && selectedKey !== "__ya_ungrouped__" && !workspaces.some((workspace) => workspace.workspaceId === selectedKey)) setSelectedKey(UNGROUPED);
			}, [selectedKey, workspaces]);
			const selectedWorkspace = selectedKey === null || selectedKey === "__ya_ungrouped__" ? void 0 : workspaces.find((workspace) => workspace.workspaceId === selectedKey);
			const levelGroups = (0, react.useMemo)(() => selectedKey !== null && selectedKey !== "__ya_ungrouped__" ? deriveWorkspaceSessionGroups(selectedKey, sessions, workspaces, archived, pendingInteractions, now) : [], [
				archived,
				pendingInteractions,
				sessions,
				workspaces,
				selectedKey,
				now
			]);
			const levelRows = selectedKey === "__ya_ungrouped__" ? deriveWorkspaceSessions(UNGROUPED, sessions, workspaces, archived, pendingInteractions) : [];
			const levelEmpty = selectedKey === "__ya_ungrouped__" ? levelRows.length === 0 : levelGroups.every((g) => g.rows.length === 0);
			const [query, setQuery] = (0, react.useState)("");
			const normalizedQuery = sanitized(query).trim();
			const [remote, setRemote] = (0, react.useState)({
				query: "",
				status: "idle",
				items: [],
				hasMore: false
			});
			(0, react.useEffect)(() => {
				if (normalizedQuery === "") {
					setRemote({
						query: "",
						status: "idle",
						items: [],
						hasMore: false
					});
					return;
				}
				const controller = new AbortController();
				setRemote({
					query: normalizedQuery,
					status: "loading",
					items: [],
					hasMore: false
				});
				const timer = window.setTimeout(() => {
					searchSessions(normalizedQuery, controller.signal).then((result) => {
						if (!controller.signal.aborted) setRemote({
							query: normalizedQuery,
							status: "ready",
							items: result.items,
							hasMore: result.hasMore
						});
					}).catch(() => {
						if (!controller.signal.aborted) setRemote({
							query: normalizedQuery,
							status: "error",
							items: [],
							hasMore: false
						});
					});
				}, SEARCH_DEBOUNCE_MS);
				return () => {
					window.clearTimeout(timer);
					controller.abort();
				};
			}, [normalizedQuery, searchSessions]);
			const searchRows = (0, react.useMemo)(() => {
				if (normalizedQuery === "") return [];
				const byId = new Map(localMatches(allRows, normalizedQuery).map((row) => [row.id, row]));
				if (remote.query === normalizedQuery) for (const item of remote.items) {
					const row = allRows.find((candidate) => candidate.id === item.sessionId);
					if (row !== void 0) byId.set(row.id, row);
				}
				return [...byId.values()].slice(0, searchResultLimit);
			}, [
				allRows,
				normalizedQuery,
				remote,
				searchResultLimit
			]);
			const [pickerOpen, setPickerOpen] = (0, react.useState)(false);
			const pickerAnchor = (0, react.useRef)(null);
			const [recentCollapsed, setRecentCollapsed] = (0, react.useState)(false);
			const [workspaceRename, setWorkspaceRename] = (0, react.useState)(null);
			const [sessionRename, setSessionRename] = (0, react.useState)(null);
			const [renameDraft, setRenameDraft] = (0, react.useState)("");
			const [renameError, setRenameError] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [deleteTarget, setDeleteTarget] = (0, react.useState)(null);
			const [actionMode, setActionModeState] = (0, react.useState)(() => getActionMode());
			const [sessionDeleteTarget, setSessionDeleteTarget] = (0, react.useState)(null);
			(0, react.useEffect)(() => subscribeActionMode(() => setActionModeState(getActionMode())), []);
			const beginWorkspaceRename = (row) => {
				setWorkspaceRename(row);
				setRenameDraft(row.title);
				setRenameError(null);
			};
			const beginSessionRename = (row) => {
				setSessionRename(row);
				setRenameDraft(row.title);
				setRenameError(null);
			};
			const closeRename = () => {
				if (!busy) {
					setWorkspaceRename(null);
					setSessionRename(null);
					setRenameError(null);
				}
			};
			const commitRename = () => {
				const title = renameDraft.trim();
				if (title === "" || busy) return;
				setBusy(true);
				(workspaceRename !== null && workspaceRename.key !== "__ya_ungrouped__" ? renameWorkspace(workspaceRename.key, title) : sessionRename !== null ? renameSession(sessionRename.id, title) : Promise.resolve()).then(() => {
					setWorkspaceRename(null);
					setSessionRename(null);
				}).catch((reason) => {
					setRenameError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setBusy(false);
				});
			};
			const confirmDelete = () => {
				if (deleteTarget === null || deleteTarget.key === "__ya_ungrouped__" || busy) return;
				setBusy(true);
				deleteWorkspace(deleteTarget.key).then(() => {
					setDeleteTarget(null);
				}).catch((reason) => {
					setRenameError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setBusy(false);
				});
			};
			const archive = (id) => {
				if (actionMode === "delete") {
					const row = allRows.find((candidate) => candidate.id === id) ?? levelRows.find((candidate) => candidate.id === id) ?? levelGroups.flatMap((g) => g.rows).find((candidate) => candidate.id === id) ?? recent.find((candidate) => candidate.id === id);
					setSessionDeleteTarget(row ?? {
						id,
						title: "",
						blank: false,
						running: false,
						completed: false,
						updatedAt: 0,
						workspaceKey: "__ya_ungrouped__",
						workspaceTitle: ""
					});
					setRenameError(null);
					return;
				}
				archiveSession(id).catch((reason) => {
					console.warn("session archive rejected:", reason);
				});
			};
			const confirmSessionDelete = () => {
				if (sessionDeleteTarget === null || busy) return;
				setBusy(true);
				archiveSession(sessionDeleteTarget.id).then(() => {
					setSessionDeleteTarget(null);
				}).catch((reason) => {
					setRenameError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setBusy(false);
				});
			};
			const toggleActionMode = () => {
				setActionMode(actionMode === "archive" ? "delete" : "archive");
			};
			const fork = (id) => {
				forkSession(id);
			};
			const sessionItem = (row, context = false) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionItem, {
				row,
				current: sessions.current,
				now,
				open,
				rename: beginSessionRename,
				fork,
				archive,
				t,
				context,
				actionMode
			}, row.id);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-ya-workspace-sidebar": true,
				className: wide ? "" : "ya-rail",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "ya-section-header",
						children: [
							wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-section-title",
								children: t("workspaces")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `ya-icon-button ya-action-mode-toggle${actionMode === "delete" ? " ya-action-mode-delete" : ""}`,
								"aria-label": t("toggleActionMode"),
								"aria-pressed": actionMode === "delete",
								title: actionMode === "delete" ? t("deleteMode") : t("archiveMode"),
								onClick: (event) => {
									event.stopPropagation();
									toggleActionMode();
								},
								children: actionMode === "delete" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, { size: wide ? 16 : 18 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutline20, { size: wide ? 16 : 18 })
							}),
							directoryFlowAvailable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								ref: pickerAnchor,
								type: "button",
								className: "ya-icon-button",
								"aria-label": t("addWorkspace"),
								onClick: () => {
									setPickerOpen((value) => !value);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconProjectAddOutline16, { size: wide ? 16 : 18 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkspacePickFlow, {
								t,
								open: pickerOpen,
								anchorRef: pickerAnchor,
								useWorkspaces,
								createWorkspace,
								useDirectoryFlow,
								renderDirectoryFlow: (owner) => renderSlot("sidebar.workspaces.directoryFlow", owner),
								addOnly: true,
								side: "right",
								onPick: (workspaceId) => {
									setPickerOpen(false);
									startSession(workspaceId);
								},
								onClose: () => {
									setPickerOpen(false);
								}
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "ya-search",
						onClick: () => {
							if (!wide) expandSidebar();
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ya-search-icon",
								"aria-label": t("search"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, { size: wide ? 14 : 18 })
							}),
							wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "ya-search-input",
								value: query,
								maxLength: SEARCH_MAX,
								placeholder: t("searchPlaceholder"),
								onChange: (event) => {
									setQuery(sanitized(event.target.value));
								}
							}),
							wide && query !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ya-icon-button",
								"aria-label": t("clearSearch"),
								onClick: () => {
									setQuery("");
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFill14, {})
							})
						]
					}),
					wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "ya-body",
						children: normalizedQuery !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "ya-scroll",
							role: "tree",
							"aria-label": t("search"),
							children: [
								searchRows.map((row) => sessionItem(row, true)),
								remote.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "ya-status",
									children: t("searching")
								}),
								remote.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "ya-status ya-warning",
									children: t("searchUnavailable")
								}),
								remote.status !== "loading" && searchRows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "ya-empty",
									children: t("noMatches")
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: `ya-recent${recentCollapsed ? " ya-recent-collapsed" : ""}`,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "ya-block-label",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("recent") }), recent.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `ya-block-label-toggle${recentCollapsed ? " ya-collapsed" : ""}`,
										"aria-label": recentCollapsed ? t("expand") : t("collapse"),
										"aria-expanded": !recentCollapsed,
										onClick: (event) => {
											event.stopPropagation();
											setRecentCollapsed((value) => !value);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, {})
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "ya-recent-list-wrap",
									children: recent.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "ya-empty",
										children: t("noSessions")
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "ya-recent-list",
										children: recent.map((row) => sessionItem(row, true))
									})
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "ya-breadcrumb",
								children: selectedKey === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "ya-crumb",
									children: t("workspaces")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "ya-crumb",
										onClick: () => {
											setDirection("backward");
											setSelectedKey(null);
										},
										children: t("workspaces")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, {}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "ya-crumb",
										children: selectedKey === "__ya_ungrouped__" ? t("ungrouped") : selectedWorkspace?.title
									}),
									selectedKey !== "__ya_ungrouped__" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "ya-icon-button",
										"aria-label": t("newSession"),
										onClick: () => {
											startSession(selectedKey);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, {})
									})
								] })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "ya-scroll",
								role: "tree",
								"aria-label": selectedKey === null ? t("workspaces") : t("sessions"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: hasMounted ? `ya-level-enter-${direction}` : void 0,
									children: [
										selectedKey === null ? workspaceGroups.flatMap((group) => [...group.dateKey === "" ? [] : [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "ya-date-group-label",
											role: "separator",
											children: dateGroupLabel(group, now, t)
										}, `ws-group-${group.dateKey}`)], ...group.rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkspaceItem, {
											row,
											enter: () => {
												setDirection("forward");
												setSelectedKey(row.key);
											},
											create: () => {
												if (row.key !== "__ya_ungrouped__") startSession(row.key);
											},
											rename: () => {
												beginWorkspaceRename(row);
											},
											remove: () => {
												setDeleteTarget(row);
												setRenameError(null);
											},
											now,
											t
										}, row.key))]) : selectedKey === "__ya_ungrouped__" ? levelRows.map((row) => sessionItem(row, false)) : levelGroups.flatMap((group) => [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "ya-date-group-label",
											role: "separator",
											children: dateGroupLabel(group, now, t)
										}, `group-${group.dateKey}`), ...group.rows.map((row) => sessionItem(row, false))]),
										selectedKey === null && workspaceRows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "ya-empty",
											children: t("noWorkspaces")
										}),
										selectedKey !== null && levelEmpty && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "ya-empty",
											children: t("noSessions")
										})
									]
								}, selectedKey ?? "root")
							})
						] })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: workspaceRename !== null || sessionRename !== null,
						onClose: closeRename,
						closeLabel: t("cancel"),
						title: workspaceRename !== null ? t("renameWorkspace") : t("renameSession"),
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy,
							onClick: closeRename,
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: busy || renameDraft.trim() === "",
							onClick: commitRename,
							children: t("rename")
						})] }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "ya-rename-input",
							value: renameDraft,
							autoFocus: true,
							disabled: busy,
							"aria-label": workspaceRename !== null ? t("workspaceName") : t("sessionName"),
							onChange: (event) => {
								setRenameDraft(event.target.value);
								setRenameError(null);
							}
						}), renameError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "ya-error",
							role: "alert",
							children: renameError
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: deleteTarget !== null,
						onClose: () => {
							if (!busy) setDeleteTarget(null);
						},
						closeLabel: t("cancel"),
						title: t("deleteWorkspace"),
						description: deleteTarget === null ? void 0 : t("deleteDescription", { name: deleteTarget.title }),
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy,
							onClick: () => {
								setDeleteTarget(null);
							},
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy,
							onClick: confirmDelete,
							children: t("deleteWorkspace")
						})] }),
						children: renameError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "ya-error",
							role: "alert",
							children: renameError
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: sessionDeleteTarget !== null,
						onClose: () => {
							if (!busy) setSessionDeleteTarget(null);
						},
						closeLabel: t("cancel"),
						title: t("deleteSessionTitle"),
						description: t("deleteSessionConfirm"),
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy,
							onClick: () => {
								setSessionDeleteTarget(null);
							},
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy,
							onClick: confirmSessionDelete,
							children: t("deleteSession")
						})] }),
						children: renameError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "ya-error",
							role: "alert",
							children: renameError
						})
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		/**
		* Services required by the replacement client entries. `remote` and
		* `remote.directoryPicker` feed the uiWorkspace stand-in's directory picking.
		*/
		const inject = [
			"slots",
			"sessions",
			"workspaces",
			"locale",
			"remote",
			"remote.directoryPicker"
		];
		/** Register the sidebar browser and conversation hero picker. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ya-workspace-sidebar: dictionaries");
			ctx.effect(() => {
				let dispose;
				const sync = () => {
					dispose?.();
					dispose = void 0;
					const store = ctx.get("betterLocale");
					if (store !== void 0) dispose = store.register(NS, dicts);
				};
				sync();
				const unsubscribe = ctx.locale.subscribe(sync);
				return () => {
					unsubscribe();
					dispose?.();
				};
			}, "ya-workspace-sidebar: better-locale override dicts");
			ctx.effect(installStyles, "ya-workspace-sidebar: styles");
			const flowSource = (name) => ({
				getSnapshot: () => ctx.slots.entries(name).length > 0,
				subscribe: (listener) => ctx.slots.subscribe(name, listener)
			});
			const sidebarFlow = flowSource("sidebar.workspaces.directoryFlow");
			const pickerFlow = flowSource("conversation.hero.workspace.directoryFlow");
			const createWorkspace = (input) => ctx.workspaces.create(input);
			const navigation = new YaWorkspaceNavigation(ctx, ctx.remote.directoryPicker, ctx.workspaces, ctx.sessions);
			ctx.slots.provideRoot({ hooks: { workspaces: ctx.workspaces.list } });
			const searchSessions = async (query, signal) => {
				const result = await ctx.sessions.search(query, signal);
				if (!result.ok) throw new Error(result.error.message);
				return result.value;
			};
			const sidebarInjected = () => ({
				startSession: (workspaceId) => {
					navigation.startSession(workspaceId);
				},
				open: (sessionId) => {
					ctx.sessions.open(sessionId);
				},
				searchSessions,
				searchResultLimit: ctx.sessions.searchResultLimit,
				renameSession: async (sessionId, title) => {
					const session = ctx.sessions.binding(sessionId)?.session;
					if (session === void 0) throw new Error(`unknown session "${sessionId}"`);
					const result = await session.rename(title);
					if (!result.ok) throw new Error(result.error.message);
				},
				forkSession: (sessionId) => {
					ctx.sessions.fork({
						sessionId,
						increaseTitle: true
					}).then((childId) => {
						ctx.sessions.open(childId);
					}).catch(() => {});
				},
				renameWorkspace: async (workspaceId, title) => {
					await ctx.workspaces.rename(workspaceId, title);
				},
				deleteWorkspace: async (workspaceId) => {
					await ctx.workspaces.delete(workspaceId);
				},
				archiveSession: async (sessionId) => {
					await navigation.archiveSession(sessionId);
				},
				insertSessionBefore: async (workspaceId, sessionId, beforeSessionId) => {
					await ctx.workspaces.insertSessionBefore(workspaceId, sessionId, beforeSessionId);
				},
				createWorkspace,
				hooks: { directoryFlow: sidebarFlow }
			});
			const pickerInjected = () => ({
				createWorkspace,
				hooks: { directoryFlow: pickerFlow }
			});
			ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({
				name: "sidebar.workspaces",
				children: { "sidebar.workspaces.directoryFlow": {
					kind: "single",
					scope: "root"
				} },
				inject: sidebarInjected,
				locale: NS
			}, WorkspaceSidebar));
			ctx.slots.inject("conversation.hero.workspace", () => ctx.slots.register({
				name: "conversation.hero.workspace",
				children: { "conversation.hero.workspace.directoryFlow": {
					kind: "single",
					scope: "root"
				} },
				inject: pickerInjected,
				locale: NS
			}, WorkspacePicker));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map