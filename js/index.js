$(document).ready(function(e){
	loadUsersHoldings('ADX');
	getCurrencyInfo();
});

function getCurrencyInfo() {
	$('.card').each(function(i, obj) {
		var currency = $(this).attr('id');

		var btcPrice;
		$.ajax({
			url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=GBP',
			type: 'get',
			dataType: 'json',
			async: false,
			success: (response) => {
				//currentBtcPrice = data.GBP;
				btcPrice = response.GBP;
			}
		});
	
		$.ajax({
			type: "POST",
			url: "http://localhost:3000/getAllHoldings",
			data: {
				currency: currency
			},
			dataType: "json",
			success: function (response) {
				$.ajax({
	
					url: `https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=BTC,GBP`,
					type: 'POST',
					dataType: 'json',
					complete: function(xhr, textStatus) {
						//called when complete
					},
					success: function(data, textStatus, xhr) {		  	
						//called when successful
						var marketValue = response.holdingsTotal * data.GBP;
						var netCost = response.netCostBtc * btcPrice;
						var profitLoss = marketValue - netCost;
		
						$('.cardFor'+currency+' .marketValue').text(marketValue.toFixed(2));
						$('.cardFor'+currency+' .netCost').text(netCost.toFixed(2));
						// $('.cardFor'+result+' .profitLoss').text('£' + profitLoss.toFixed(2));
						if(profitLoss > 0) {
							$('.cardFor'+currency+' .profitLoss').removeClass('badge-danger');
							$('.cardFor'+currency+' .profitLoss').addClass('badge-success');
							$('.cardFor'+currency+' .profitLoss').text('£' + profitLoss.toFixed(2));
						} else {
							$('.cardFor'+currency+' .profitLoss').removeClass('badge-success');
							$('.cardFor'+currency+' .profitLoss').addClass('badge-danger');		    	
							$('.cardFor'+currency+' .profitLoss').text('£'+profitLoss.toFixed(2));
						}
					},
					error: function(xhr, textStatus, errorThrown) {
						//called when there is an error
					}
				});	
						
			}
		});			
	});
	//currencies.map( (result) => {
	//});
}

function loadUsersHoldings(currency, userID = null) {
	$('.card').each(function(i, obj) {
		var currency = $(this).attr('id');

		var btcPrice;
		$.ajax({
			url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=GBP',
			type: 'get',
			dataType: 'json',
			async: false,
			success: (response) => {
				//currentBtcPrice = data.GBP;
				btcPrice = response.GBP;
			}
		});
	
		$.ajax({
			type: "POST",
			url: "http://localhost:3000/getUserHoldings",
			data: {
				currency: currency,
			},
			dataType: "json",
			success: function (response) {
				var holdings = response.map(function(holding) {
						var cost = holding.holdings * holding.rate * btcPrice;
						var date = new Date(holding.date);
						var dd = date.getDate();
						var mm = date.getMonth()+1; //January is 0!
						var yyyy = date.getFullYear();	
						date = yyyy + '-' + mm + '-' + dd;					
	
						var trTemplate = `
						<tr id=${holding._id}>
							<td class='holdingsAm'>${holding.holdings}</td>
							<td class='rateAm'>${holding.rate}</td>
							<td class='cost'>&pound;${cost.toFixed(2)}</td>
							<td class='remove'><i class="material-icons">delete</i></td>
						</tr>
					`;				
					
					$('.cardFor'+currency+' .exchangesTable').append(trTemplate);
					$(".table").trigger("update");
				})
			}
		});		
	});
	
}

$('.addHolding').click(function(event) {
	event.preventDefault();
	var btcPrice;
	$.ajax({
		url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=GBP',
		type: 'get',
		dataType: 'json',
		async: false,
		success: (response) => {
			//currentBtcPrice = data.GBP;
			btcPrice = response.GBP;
		}
	});

	var currency = $(this).closest('.card').find('.currencyTag').text();
	var holdingsAmount = $('.cardFor'+currency+' .holdings').val();
	var rateAmount = $('.cardFor'+currency+' .rate').val();

	var cost = holdingsAmount * rateAmount * btcPrice;

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();	
	today = yyyy + '-' + mm + '-' + dd;

	$('.holdings').val('');
	$('.rate').val('');

	$.ajax({
		type: "POST",
		url: "http://localhost:3000/logUserHoldings",
		data: {
			currency: currency,
			holdings: holdingsAmount,
			rate: rateAmount,
			date: today
		},
		dataType: "json",
		success: function (response) {
				var trTemplate = `
				<tr id=${response}>
					<td class='holdingsAm'>${holdingsAmount}</td>
					<td class='rateAm'>${rateAmount}</td>
					<td class='cost'>&pound;${cost.toFixed(2)}</td>
					<td class='remove'><i class="material-icons">delete</i></td>
				</tr>
			`;
		
			$('.cardFor'+currency+' .exchangesTable').append(trTemplate);						
		}
	});
	getCurrencyInfo();
	$(".table").trigger("update");	
});

$('.table').on('click','.remove',function(event) {
	var docID = $(this).closest('tr').attr('id');

	$.ajax({
		type: "POST",
		url: "http://localhost:3000/deleteUserHolding",
		data: {
			_id: docID
		},
		dataType: "json",
		success: function (response) {
			console.log(response);
		}
	});	

	$(this).closest('tr').fadeOut(300, function() {
		$(this).remove();
	});

	getCurrencyInfo();
});

$('.addNewCurrency').click(function(event) {
	event.preventDefault();
	var thisCurrencyName = 'BitCoin';
	var thisCurrencyTag = 'BTC';
	var localCurrency = 'GBP';
	var cardTemplate = `
	    <div class="col-md-6">
	      <div class="card cardFor${thisCurrencyTag}" id="${thisCurrencyTag}">
	        <div class="card-body">
	          <h3 class="float-md-right"><span class="badge badge-secondary profitLoss"></span></h3>
	          <h4 class="card-title"><span class="currencyTag">${thisCurrencyName}</span> (${thisCurrencyTag})</h4>
	          <p class="card-text">Market Value (${localCurrency}): &pound;<span class="marketValue"></span></p>
	          <p class="card-text">Net Cost (${localCurrency}): &pound;<span class="netCost"></span></p>

	          <div class="addHoldings">
	            <form>
	              <div class="form-row">
	                <div class="form-group">
	                  <input name="holdings" type="text" class="form-control holdings" placeholder="Enter your holdings" onkeypress="return isNumberKey(event)">
	                </div>
	                <div class="form-group">
	                  <input name="rate" type="text" class="form-control rate" placeholder="Enter the rate" onkeypress="return isNumberKey(event)">
	                </div>
	                <div class="form-group">
	                  <input type="submit" class="btn btn-primary addHolding" value="Add">
	                </div>                
	              </div>
	            </form>
	          </div>

	          <table class="table tablesorter">
	            <thead>
	              <tr>
	                <th>Holdings</th>
	                <th>Rate</th>
	                <th>Current BTC Cost</th>
	                <th>Remove</th>
	              </tr>
	            </thead>
	            <tbody class="exchangesTable">
	            </tbody>
	          </table>
	        </div>
	      </div>
	    </div> 
	`;

	$('.currenciesRow').append(cardTemplate);
});