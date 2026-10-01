// app/page.js
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
	const [records, setRecords] = useState([]);
	const [form, setForm] = useState({
		odo: '',
		totalCost: '',
		pricePerLitre: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Auto-calculate liters
	const liters =
		form.totalCost && form.pricePerLitre
			? (
					parseFloat(form.totalCost) / parseFloat(form.pricePerLitre)
				).toFixed(2)
			: '0.00';

	useEffect(() => {
		fetchRecords();
	}, []);

	const fetchRecords = async () => {
		const res = await fetch('/api/fuel');
		const data = await res.json();
		setRecords(data);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		await fetch('/api/fuel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				odo: form.odo,
				'total cost': form.totalCost,
				'price / litre': form.pricePerLitre,
				liters: liters,
			}),
		});

		setForm({ odo: '', totalCost: '', pricePerLitre: '' });
		setIsSubmitting(false);
		fetchRecords(); // Refresh the list
	};

	// Neumorphic Styles
	const bgDark = '#1c212b';
	const neuInset = 'inset 4px 4px 6px #0e1116, inset -4px -4px 6px #2a3140';
	const neuExtrude = '5px 5px 10px #0e1116, -5px -5px 10px #2a3140';

	return (
		<div
			style={{
				background: bgDark,
				minHeight: '100vh',
				padding: '40px 20px',
				fontFamily: 'system-ui, sans-serif',
			}}
		>
			<div style={{ maxWidth: '400px', margin: '0 auto' }}>
				{/* Input Form */}
				<form
					onSubmit={handleSubmit}
					style={{
						display: 'flex',
						flexDirection: 'column',
						marginBottom: '40px',
					}}
				>
					<h2
						style={{
							color: '#fff',
							marginBottom: '24px',
							textAlign: 'center',
						}}
					>
						New Fuel Log
					</h2>

					<input
						type="number"
						step="any"
						required
						placeholder="Odometer (km)"
						value={form.odo}
						onChange={(e) =>
							setForm({ ...form, odo: e.target.value })
						}
						style={{
							padding: '18px',
							borderRadius: '16px',
							background: bgDark,
							border: 'none',
							color: '#fff',
							boxShadow: neuInset,
							marginBottom: '20px',
							outline: 'none',
						}}
					/>
					<input
						type="number"
						step="any"
						required
						placeholder="Total Cost (₹)"
						value={form.totalCost}
						onChange={(e) =>
							setForm({ ...form, totalCost: e.target.value })
						}
						style={{
							padding: '18px',
							borderRadius: '16px',
							background: bgDark,
							border: 'none',
							color: '#fff',
							boxShadow: neuInset,
							marginBottom: '20px',
							outline: 'none',
						}}
					/>
					<input
						type="number"
						step="any"
						required
						placeholder="Price per Litre (₹)"
						value={form.pricePerLitre}
						onChange={(e) =>
							setForm({ ...form, pricePerLitre: e.target.value })
						}
						style={{
							padding: '18px',
							borderRadius: '16px',
							background: bgDark,
							border: 'none',
							color: '#fff',
							boxShadow: neuInset,
							marginBottom: '20px',
							outline: 'none',
						}}
					/>

					<div
						style={{
							padding: '18px',
							borderRadius: '16px',
							background: bgDark,
							color: '#99a6b8',
							boxShadow: neuInset,
							marginBottom: '30px',
							display: 'flex',
							justifyContent: 'space-between',
						}}
					>
						<span>Calculated Liters:</span>
						<span style={{ color: '#f2a6bf', fontWeight: 'bold' }}>
							{liters} L
						</span>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						style={{
							padding: '18px',
							borderRadius: '16px',
							background: bgDark,
							border: 'none',
							color: '#f2a6bf',
							fontWeight: 'bold',
							fontSize: '16px',
							boxShadow: neuExtrude,
							cursor: 'pointer',
						}}
					>
						{isSubmitting ? 'Saving...' : 'Save Record'}
					</button>
				</form>

				{/* History List */}
				<h3 style={{ color: '#fff', marginBottom: '20px' }}>History</h3>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '20px',
					}}
				>
					{records.map((record) => (
						<div
							key={record._id}
							style={{
								padding: '20px',
								borderRadius: '16px',
								background: bgDark,
								boxShadow: neuExtrude,
								display: 'flex',
								justifyContent: 'space-between',
							}}
						>
							<div>
								<div
									style={{
										color: '#fff',
										fontWeight: 'bold',
										marginBottom: '4px',
									}}
								>
									{new Date(record.date).toLocaleDateString()}
								</div>
								<div
									style={{
										color: '#99a6b8',
										fontSize: '14px',
									}}
								>
									Odo: {record.odo} km
								</div>
							</div>
							<div style={{ textAlign: 'right' }}>
								<div
									style={{
										color: '#f2a6bf',
										fontWeight: 'bold',
										marginBottom: '4px',
									}}
								>
									₹{record['total cost']}
								</div>
								<div
									style={{
										color: '#99a6b8',
										fontSize: '14px',
									}}
								>
									{record.liters} L @ ₹
									{record['price / litre']}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
