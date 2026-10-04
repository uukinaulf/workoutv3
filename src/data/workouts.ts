import { DEFAULT_REST, DEFAULT_WORK, estimateMinutes } from '../lib/timer.ts';

export type WorkoutLevel = 'Pemula' | 'Menengah' | 'Lanjutan' | 'Semua level';

export interface Workout {
	id: string;
	title: string;
	level: WorkoutLevel;
	duration: number;
	focus: string;
	color: string;
	exercises: string[];
	rounds: number;
	target: string;
	tip: string;
	easier: string;
}

export interface ExerciseGuide {
	target: string;
	steps: string;
	breath: string;
	avoid: string;
	easier: string;
}

type Program = Omit<Workout, 'duration'>;

/** Rounds tuned so the derived duration matches the advertised session length. */
const programs: Program[] = [
	{ id: 'full-body', title: 'Full Body Starter', level: 'Pemula', focus: 'Seluruh tubuh', color: 'lime', exercises: ['Jumping Jack', 'Bodyweight Squat', 'Incline Push-up', 'Glute Bridge'], rounds: 3, target: 'Seluruh tubuh', tip: 'Jaga ritme napas dan mendarat lembut.', easier: 'Step jack tanpa lompatan.' },
	{ id: 'core', title: 'Core Foundation', level: 'Pemula', focus: 'Core', color: 'orange', exercises: ['Dead Bug', 'Bird Dog', 'Plank', 'Mountain Climber'], rounds: 3, target: 'Perut dan punggung', tip: 'Tekan punggung bawah ke lantai saat core bergerak.', easier: 'Kurangi durasi plank menjadi 15 detik.' },
	{ id: 'strength', title: 'Strength Builder', level: 'Menengah', focus: 'Kekuatan', color: 'blue', exercises: ['Tempo Squat', 'Push-up', 'Reverse Lunge', 'Pike Push-up'], rounds: 6, target: 'Kaki, dada, bahu', tip: 'Turun perlahan, dorong lantai dengan stabil.', easier: 'Gunakan lutut untuk push-up.' },
	{ id: 'hiit', title: 'Quick HIIT Burn', level: 'Menengah', focus: 'Kardio', color: 'pink', exercises: ['High Knees', 'Squat Thrust', 'Skater Jump', 'Plank Jack'], rounds: 5, target: 'Jantung dan seluruh tubuh', tip: 'Pertahankan intensitas, tapi tetap bisa bicara pendek.', easier: 'Ganti lompatan dengan langkah cepat.' },
	{ id: 'mobility', title: 'Morning Mobility', level: 'Semua level', focus: 'Mobilitas', color: 'purple', exercises: ['Cat Cow', 'World’s Greatest Stretch', 'Hip Opener', 'Child’s Pose'], rounds: 2, target: 'Pinggul dan tulang belakang', tip: 'Bergerak dalam rentang nyaman, tanpa memaksa.', easier: 'Tahan setiap posisi lebih singkat.' },
	{ id: 'lower', title: 'Lower Body Power', level: 'Lanjutan', focus: 'Kaki', color: 'yellow', exercises: ['Jump Squat', 'Bulgarian Split Squat', 'Single-leg Bridge', 'Calf Raise'], rounds: 6, target: 'Glutes dan kaki', tip: 'Dorong dari telapak kaki dan jaga lutut searah jari.', easier: 'Hapus lompatan dan gunakan squat biasa.' },
];

export const workouts: Workout[] = programs.map(program => ({
	...program,
	duration: estimateMinutes(program.exercises.length, program.rounds, DEFAULT_WORK, DEFAULT_REST),
}));

export const exerciseGuide: Record<string, ExerciseGuide> = {
	'Jumping Jack': { target: 'Kardio seluruh tubuh', steps: 'Berdiri tegak, kaki rapat. Lompat buka kaki sambil angkat tangan, lalu kembali rapat.', breath: 'Buang napas saat membuka kaki.', avoid: 'Jangan mendarat dengan lutut terkunci.', easier: 'Lakukan step jack tanpa lompatan.' },
	'Bodyweight Squat': { target: 'Paha dan glutes', steps: 'Kaki selebar bahu. Dorong pinggul ke belakang, tekuk lutut, lalu berdiri dengan mendorong lantai.', breath: 'Tarik napas turun, buang napas naik.', avoid: 'Lutut jangan jatuh ke dalam.', easier: 'Turun ke kursi sebagai sasaran.' },
	'Incline Push-up': { target: 'Dada, bahu, trisep', steps: 'Tangan di tepi meja atau dinding. Tubuh lurus, tekuk siku mendekat ke badan, dorong kembali.', breath: 'Tarik napas turun, buang napas mendorong.', avoid: 'Jangan biarkan pinggul turun.', easier: 'Gunakan dinding dengan posisi lebih tegak.' },
	'Glute Bridge': { target: 'Glutes dan hamstring', steps: 'Berbaring, lutut ditekuk. Tekan tumit, angkat pinggul sampai badan membentuk garis lurus, lalu turunkan.', breath: 'Buang napas saat mengangkat pinggul.', avoid: 'Jangan melengkungkan pinggang berlebihan.', easier: 'Angkat pinggul dengan jarak lebih pendek.' },
	'Dead Bug': { target: 'Core dan kontrol tubuh', steps: 'Berbaring, tangan ke atas, lutut 90 derajat. Turunkan tangan dan kaki berlawanan tanpa mengangkat pinggang.', breath: 'Buang napas saat tangan dan kaki menjauh.', avoid: 'Pinggang tetap menempel lantai.', easier: 'Gerakkan satu anggota tubuh saja.' },
	'Bird Dog': { target: 'Core dan punggung', steps: 'Posisi merangkak. Rentangkan tangan kanan dan kaki kiri, tahan, kembali, lalu ganti sisi.', breath: 'Bernapas stabil selama menahan posisi.', avoid: 'Jangan memutar pinggul.', easier: 'Angkat tangan atau kaki saja.' },
	'Plank': { target: 'Core, bahu, glutes', steps: 'Siku tepat di bawah bahu. Luruskan badan dari kepala sampai tumit dan kencangkan perut.', breath: 'Bernapas pendek dan stabil.', avoid: 'Jangan tahan napas atau biarkan pinggang turun.', easier: 'Turunkan lutut ke lantai.' },
	'Mountain Climber': { target: 'Core dan kardio', steps: 'Mulai dari posisi plank. Tarik satu lutut ke dada, kembalikan, lalu ganti sisi secara bergantian.', breath: 'Buang napas setiap lutut maju.', avoid: 'Bahu tetap di atas pergelangan tangan.', easier: 'Langkahkan kaki pelan, tanpa lompatan.' },
	'Tempo Squat': { target: 'Kaki dan kontrol gerak', steps: 'Lakukan squat, turunkan badan selama tiga hitungan, tahan sebentar, lalu berdiri.', breath: 'Tarik napas turun, buang napas naik.', avoid: 'Jangan jatuh bebas saat turun.', easier: 'Gunakan tempo normal.' },
	'Push-up': { target: 'Dada, bahu, trisep', steps: 'Tangan sedikit lebih lebar dari bahu. Turunkan dada mendekati lantai dengan badan lurus, lalu dorong.', breath: 'Tarik napas turun, buang napas naik.', avoid: 'Siku jangan melebar 90 derajat.', easier: 'Lakukan dari lutut.' },
	'Reverse Lunge': { target: 'Glutes dan paha', steps: 'Langkahkan satu kaki ke belakang, turunkan lutut ke arah lantai, lalu dorong kaki depan untuk kembali.', breath: 'Tarik napas turun, buang napas naik.', avoid: 'Lutut depan tetap searah jari kaki.', easier: 'Pegang dinding untuk keseimbangan.' },
	'Pike Push-up': { target: 'Bahu dan trisep', steps: 'Bentuk huruf V terbalik. Tekuk siku, arahkan kepala ke lantai di antara tangan, lalu dorong.', breath: 'Tarik napas turun, buang napas mendorong.', avoid: 'Jangan menekuk punggung terlalu rata.', easier: 'Kurangi kedalaman gerak.' },
	'High Knees': { target: 'Kardio dan pinggul', steps: 'Berdiri tegak, angkat lutut bergantian setinggi pinggul sambil mengayun tangan.', breath: 'Bernapas ritmis dan teratur.', avoid: 'Jangan condong terlalu jauh ke belakang.', easier: 'Lakukan marching tanpa lompatan.' },
	'Squat Thrust': { target: 'Kardio seluruh tubuh', steps: 'Dari berdiri, jongkok dan letakkan tangan, langkahkan kaki ke belakang, kembali ke jongkok, lalu berdiri.', breath: 'Buang napas saat kembali berdiri.', avoid: 'Jaga bahu tidak menjauh dari tangan.', easier: 'Langkahkan kaki satu per satu.' },
	'Skater Jump': { target: 'Glutes dan koordinasi', steps: 'Lompat menyamping dari satu kaki ke kaki lain, ayunkan kaki belakang di belakang tubuh.', breath: 'Buang napas saat mendarat.', avoid: 'Mendarat lembut dengan lutut sedikit menekuk.', easier: 'Lakukan langkah menyamping tanpa lompat.' },
	'Plank Jack': { target: 'Core dan kardio', steps: 'Dari plank, lompat buka-tutup kaki seperti jumping jack sambil menjaga badan stabil.', breath: 'Bernapas stabil, buang napas saat kaki membuka.', avoid: 'Jangan biarkan pinggul bergoyang.', easier: 'Tap kaki keluar satu per satu.' },
	'Cat Cow': { target: 'Mobilitas tulang belakang', steps: 'Dari merangkak, lengkungkan punggung sambil menunduk, lalu turunkan perut dan buka dada perlahan.', breath: 'Buang napas saat membulat, tarik napas saat membuka dada.', avoid: 'Gerak perlahan, bukan dipaksa.', easier: 'Kurangi rentang gerak.' },
	'World’s Greatest Stretch': { target: 'Pinggul, paha, punggung', steps: 'Dari posisi lunge, letakkan tangan di dalam kaki depan dan putar tangan satunya ke langit-langit.', breath: 'Tarik napas saat membuka dada.', avoid: 'Tumit kaki belakang boleh terangkat.', easier: 'Letakkan lutut belakang di lantai.' },
	'Hip Opener': { target: 'Pinggul dan paha dalam', steps: 'Dari posisi merangkak, buka satu lutut ke samping tanpa memutar badan, lalu kembali.', breath: 'Bernapas perlahan sepanjang gerak.', avoid: 'Jaga bahu tetap sejajar.', easier: 'Buka lutut dengan jarak kecil.' },
	'Child’s Pose': { target: 'Punggung dan pinggul', steps: 'Duduk ke arah tumit, rentangkan tangan ke depan, dan biarkan dahi mendekati lantai.', breath: 'Tarik napas panjang dan rileks.', avoid: 'Jangan memaksa tumit atau bahu.', easier: 'Buka lutut lebih lebar.' },
	'Jump Squat': { target: 'Glutes dan daya ledak kaki', steps: 'Turun ke squat, dorong lantai untuk melompat, lalu mendarat lembut dan langsung kontrol turun.', breath: 'Buang napas saat melompat.', avoid: 'Lutut mengikuti arah jari kaki.', easier: 'Hapus lompatan.' },
	'Bulgarian Split Squat': { target: 'Kaki dan keseimbangan', steps: 'Letakkan punggung kaki di permukaan rendah, turunkan pinggul lurus ke bawah, lalu dorong kaki depan.', breath: 'Tarik napas turun, buang napas naik.', avoid: 'Jangan menumpu berat pada kaki belakang.', easier: 'Gunakan posisi split squat biasa.' },
	'Single-leg Bridge': { target: 'Glutes dan hamstring', steps: 'Berbaring, satu kaki menapak dan satu kaki terangkat. Angkat pinggul dengan kaki yang menapak, lalu turunkan.', breath: 'Buang napas saat mengangkat.', avoid: 'Pinggul tetap sejajar kiri dan kanan.', easier: 'Gunakan kedua kaki.' },
	'Calf Raise': { target: 'Betis dan pergelangan kaki', steps: 'Berdiri tegak, angkat tumit setinggi mungkin, tahan sebentar, lalu turunkan perlahan.', breath: 'Buang napas saat mengangkat tumit.', avoid: 'Jangan bergoyang ke luar.', easier: 'Pegang dinding untuk keseimbangan.' },
};
