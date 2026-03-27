CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`professionalProfile` enum('clinical_doctor','specialist_doctor','psychologist','nutritionist') NOT NULL,
	`hasCNPJ` enum('yes','no','pending') NOT NULL DEFAULT 'no',
	`cnpj` varchar(18),
	`companyName` varchar(255),
	`registrationNumber` varchar(50) NOT NULL,
	`registrationState` varchar(2) NOT NULL,
	`yearsOfExperience` int NOT NULL,
	`specialties` text,
	`certifications` text,
	`additionalInfo` text,
	`candidateStatus` enum('ready','pending','rejected') NOT NULL DEFAULT 'pending',
	`pendingReasons` text,
	`s3FolderPath` varchar(500),
	`s3FileName` varchar(255),
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`notificationSentAt` timestamp,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submissionLogs_id` PRIMARY KEY(`id`)
);
