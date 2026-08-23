import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../../config/database.js';
import { FaydaSimulatedRecord } from './fayda-simulated.model.js';

const records = [
  { idNumber: '1234567890', name: 'Robel Alemayehu', dateOfBirth: '2004-09-05' },
  { idNumber: '2345678901', name: 'Nardos Haile', dateOfBirth: '2005-08-18' },
  { idNumber: '3456789012', name: 'Natnael Ashenafi', dateOfBirth: '2003-09-20' },
  { idNumber: '4567890123', name: 'Natnael Sebhat', dateOfBirth: '2005-09-14' },
  { idNumber: '4567890167', name: 'Natnael Abrha', dateOfBirth: '2005-07-12' },
  { idNumber: '4547890167', name: 'Natnael Zerihun', dateOfBirth: '2004-09-05' },
  { idNumber: '4547890457', name: 'Natnael Ashenafi', dateOfBirth: '2003-09-20' },
  { idNumber: '5678901234', name: 'Abebe Bikila', dateOfBirth: '1998-03-12' },
  { idNumber: '6789012345', name: 'Selamawit Kebede', dateOfBirth: '2001-11-25' },
  { idNumber: '7890123456', name: 'Tewodros Kassaye', dateOfBirth: '1999-07-14' },
  { idNumber: '8901234567', name: 'Bethelhem Tadesse', dateOfBirth: '2002-05-30' },
  { idNumber: '9012345678', name: 'Yonas Alemu', dateOfBirth: '2000-01-19' },
  { idNumber: '1122334455', name: 'Kaleb Girma', dateOfBirth: '2003-04-10' },
  { idNumber: '2233445566', name: 'Frehiwot Worku', dateOfBirth: '2002-09-22' },
  { idNumber: '3344556677', name: 'Henok Mengistu', dateOfBirth: '1997-12-05' },
  { idNumber: '4455667788', name: 'Makeda Desta', dateOfBirth: '2004-02-18' },
  { idNumber: '5566778899', name: 'Ephrem Birhanu', dateOfBirth: '2001-08-07' },
  { idNumber: '6677889900', name: 'Hanna Tesfaye', dateOfBirth: '2003-06-15' },
  { idNumber: '7788990011', name: 'Dawit Getachew', dateOfBirth: '1998-10-03' },
  { idNumber: '8899001122', name: 'Mahlet Solomon', dateOfBirth: '2002-01-27' },
  { idNumber: '9900112233', name: 'Bereketeab Fisseha', dateOfBirth: '2000-11-11' },
  { idNumber: '1010202030', name: 'Kidist Negash', dateOfBirth: '2003-07-04' },
  { idNumber: '2020304050', name: 'Abenezer Yohannes', dateOfBirth: '1999-09-09' },
  { idNumber: '3030405060', name: 'Hiwot Demisse', dateOfBirth: '2004-03-21' },
  { idNumber: '4040506070', name: 'Mikiyas Gebre', dateOfBirth: '2001-05-16' },
  { idNumber: '5050607080', name: 'Helen Bekele', dateOfBirth: '2002-12-01' },
  { idNumber: '6060708090', name: 'Sileshi Wondimu', dateOfBirth: '1996-04-28' },
  { idNumber: '7070809010', name: 'Tsion Berhane', dateOfBirth: '2003-10-17' },
  { idNumber: '8080901020', name: 'Kidus Tsegaye', dateOfBirth: '2005-02-14' },
  { idNumber: '9090102030', name: 'Rahel Mesfin', dateOfBirth: '2000-06-25' },
  { idNumber: '1212343456', name: 'Solomon Bogale', dateOfBirth: '1997-08-30' },
  { idNumber: '2323454567', name: 'Martha Hailu', dateOfBirth: '2002-04-08' },
  { idNumber: '3434565678', name: 'Biniam Zewde', dateOfBirth: '2001-01-05' },
  { idNumber: '4545676789', name: 'Eden Tekle', dateOfBirth: '2003-11-19' },
  { idNumber: '5656787890', name: 'Ermias Assefa', dateOfBirth: '1999-07-23' },
  { idNumber: '6767898901', name: 'Lomi Melaku', dateOfBirth: '2004-10-12' },
  { idNumber: '7878909012', name: 'Tinsae Kassa', dateOfBirth: '2002-03-01' },
  { idNumber: '8989010123', name: 'Yeabsira Gashaw', dateOfBirth: '2005-05-29' },
  { idNumber: '9090121234', name: 'Samuel Mulugeta', dateOfBirth: '1998-09-17' },
  { idNumber: '1357924680', name: 'Bethlehem Shiferaw', dateOfBirth: '2001-02-11' },
  { idNumber: '2468013579', name: 'Surafel Eshetu', dateOfBirth: '2003-08-24' },
  { idNumber: '9876543210', name: 'Danawit Fikru', dateOfBirth: '2002-06-06' },
  { idNumber: '8765432109', name: 'Kidus Wolde', dateOfBirth: '2000-12-14' },
  { idNumber: '7654321098', name: 'Roba Dibaba', dateOfBirth: '1997-04-02' },
  { idNumber: '6543210987', name: 'Sifan Hassan', dateOfBirth: '2003-01-20' },
  { idNumber: '5432109876', name: 'Girma Banti', dateOfBirth: '2004-09-18' },
  { idNumber: '4321098765', name: 'Tigist Assefa', dateOfBirth: '2001-10-31' },
  { idNumber: '3210987654', name: 'Tamirat Tola', dateOfBirth: '1998-06-08' },
  { idNumber: '2109876543', name: 'Letesenbet Gidey', dateOfBirth: '2002-07-26' },
  { idNumber: '1098765432', name: 'Gudaf Tsegay', dateOfBirth: '2003-03-03' },
  { idNumber: '9988776655', name: 'Berhanu Nega', dateOfBirth: '1996-11-15' },
  { idNumber: '8877665544', name: 'Mezgebu Sileshi', dateOfBirth: '2000-04-22' },
  { idNumber: '7766554433', name: 'Azeb Abera', dateOfBirth: '2004-08-14' },
  { idNumber: '6655443322', name: 'Haile Gebrselassie', dateOfBirth: '1995-04-18' },
  { idNumber: '5544332211', name: 'Kenenisa Bekele', dateOfBirth: '1996-06-13' },
  { idNumber: '4433221100', name: 'Derartu Tulu', dateOfBirth: '1997-03-21' },
  { idNumber: '3322110099', name: 'Tirunesh Dibaba', dateOfBirth: '2000-06-01' },
];

async function seed() {
  await connectDatabase();
  await FaydaSimulatedRecord.deleteMany({}); // clean slate each run
  await FaydaSimulatedRecord.insertMany(records);
  console.log(`[seed] inserted ${records.length} fayda_simulated_records`);
  await disconnectDatabase();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});